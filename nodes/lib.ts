// Shared bounds, parse/serialize glue, term<->proto bridging, and CURIE
// arithmetic for the rdf-tools nodes. Not a node and not a test file, so it
// is neither registered nor collected by jest.
//
// The algorithmically hard part - RDF syntax tokenizing/parsing/
// serialization (Turtle, N-Triples, N-Quads, TriG) and JSON-LD expand/
// compact/toRDF/fromRDF - is entirely owned by n3 (MIT) and jsonld (BSD-3-
// Clause); nothing here re-implements any of it. What lives here is: (a)
// input-size bounds enforced BEFORE either library ever sees the input, (b)
// a Term/Quad <-> proto bridge, (c) deterministic sort ordering for the
// distinct-term extraction nodes, (d) a fixed documentLoader that refuses
// every URL (no remote @context fetch, ever), and (e) CURIE expand/compact
// arithmetic over a caller-supplied prefix map - a lookup, not parsing logic.

import * as N3 from 'n3';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsonld = require('jsonld');
import { Term, Quad, QuadList } from '../gen/messages_pb';

/** Ceiling for any raw RDF document (ParseRequest.text, SerializeRequest's
 * total, ConvertRequest.text, GetPrefixesRequest.text, ValidateRequest.text,
 * JsonLdFromRdfRequest.nquads_text). 10 MiB - far beyond any realistic RDF
 * document exchanged over an API call, comfortably under typical gateway
 * body caps. */
export const MAX_TEXT_BYTES = 10_000_000;

/** Ceiling for a JSON-LD document or context string
 * (JsonLd*Request.document_json / context_json). 10 MiB, same rationale. */
export const MAX_JSON_BYTES = 10_000_000;

/** Ceiling on the number of quads any node will parse or accept as input.
 * Applied AFTER parsing (n3's own streaming parser has no separate
 * pre-check, but is checked incrementally as quads are produced so an
 * over-count aborts without holding the full oversized result) and as a
 * simple array-length check on any node accepting a QuadList/quads field
 * directly. High enough for any realistic document (1M quads is already an
 * unusually large RDF payload for a synchronous API call) while bounding
 * memory and output size. */
export const MAX_QUADS = 1_000_000;

export class BoundsError extends Error {}

/** Rejects oversized input (by UTF-8 byte length, not JS string length). */
export function checkBytes(value: string, field: string, max: number): void {
  if (Buffer.byteLength(value, 'utf8') > max) {
    throw new BoundsError(`${field} exceeds ${max} bytes`);
  }
}

/** Rejects an input quad array beyond MAX_QUADS. */
export function checkQuadCount(count: number, field = 'quads'): void {
  if (count > MAX_QUADS) {
    throw new BoundsError(`${field} exceeds ${MAX_QUADS} quads`);
  }
}

/** Turns a caught value into a stable error message. */
export function errorMessage(e: unknown, context: string): string {
  if (e instanceof Error) {
    return `${context}: ${e.message}`;
  }
  return `${context}: ${String(e)}`;
}

/** Same as errorMessage, but for a jsonld.js error specifically: jsonld.js
 * wraps ANY documentLoader failure (including our own noNetworkDocumentLoader
 * refusal) in a generic outer "jsonld.InvalidUrl" message ("Dereferencing a
 * URL did not result in a valid JSON-LD object...") and puts the ACTUAL
 * underlying reason on `e.details.cause`. Surfacing the outer message alone
 * would hide the real, more useful reason ("remote loading is disabled")
 * behind a generic-sounding network-failure message; this unwraps to the
 * inner cause when jsonld.js provides one. */
export function jsonLdErrorMessage(e: unknown, context: string): string {
  const withDetails = e as { details?: { cause?: unknown } };
  const cause = withDetails?.details?.cause;
  if (cause instanceof Error) {
    return `${context}: ${cause.message}`;
  }
  return errorMessage(e, context);
}

// ---------------------------------------------------------------------------
// Term / Quad <-> proto bridge
// ---------------------------------------------------------------------------

const XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';

/** Converts an rdfjs (N3) term into our proto Term message. */
export function rdfTermToProto(term: N3.Term): Term {
  const t = new Term();
  t.setTermType(term.termType);
  switch (term.termType) {
    case 'NamedNode':
    case 'BlankNode':
      t.setValue(term.value);
      break;
    case 'Literal': {
      const lit = term as N3.Literal;
      t.setValue(lit.value);
      t.setDatatype(lit.datatype ? lit.datatype.value : XSD_STRING);
      t.setLanguage(lit.language || '');
      break;
    }
    case 'DefaultGraph':
      // value intentionally left empty.
      break;
    default:
      // Variable or another term type this package never produces/accepts
      // (n3 only emits NamedNode/BlankNode/Literal/DefaultGraph from a
      // Parser in non-N3 mode). Store the raw value defensively rather than
      // silently dropping it.
      t.setValue(term.value);
      break;
  }
  return t;
}

/** Converts our proto Term back into an rdfjs (N3) term for feeding into
 * N3.Writer or building filter/comparison terms. Throws BoundsError on an
 * unrecognized term_type or a Literal with both a non-default datatype AND
 * a language tag (mutually exclusive per RDF 1.1). */
export function protoToRdfTerm(t: Term): N3.Term {
  const { namedNode, blankNode, literal, defaultGraph } = N3.DataFactory;
  const termType = t.getTermType();
  const value = t.getValue();
  switch (termType) {
    case 'NamedNode':
      return namedNode(value);
    case 'BlankNode':
      return blankNode(value);
    case 'Literal': {
      const datatype = t.getDatatype();
      const language = t.getLanguage();
      if (language) {
        if (datatype && datatype !== XSD_STRING && datatype !== 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString') {
          throw new BoundsError('Literal term has both a language tag and a non-default datatype');
        }
        return literal(value, language);
      }
      return literal(value, datatype ? namedNode(datatype) : undefined);
    }
    case 'DefaultGraph':
      return defaultGraph();
    default:
      throw new BoundsError(`unrecognized term_type "${termType}"`);
  }
}

/** Converts an rdfjs Quad into our proto Quad. */
export function rdfQuadToProto(q: N3.Quad): Quad {
  const out = new Quad();
  out.setSubject(rdfTermToProto(q.subject));
  out.setPredicate(rdfTermToProto(q.predicate));
  out.setObject(rdfTermToProto(q.object));
  out.setGraph(rdfTermToProto(q.graph));
  return out;
}

/** Converts our proto Quad back into an rdfjs Quad. */
export function protoToRdfQuad(q: Quad): N3.Quad {
  const { quad } = N3.DataFactory;
  const subject = protoToRdfTerm(q.getSubject()!) as N3.Quad_Subject;
  const predicate = protoToRdfTerm(q.getPredicate()!) as N3.Quad_Predicate;
  const object = protoToRdfTerm(q.getObject()!) as N3.Quad_Object;
  const graphProto = q.getGraph();
  const graph = graphProto ? (protoToRdfTerm(graphProto) as N3.Quad_Graph) : N3.DataFactory.defaultGraph();
  return quad(subject, predicate, object, graph);
}

// ---------------------------------------------------------------------------
// Parsing / serializing
// ---------------------------------------------------------------------------

export type RdfFormat = 'turtle' | 'ntriples' | 'nquads' | 'trig';

/** Maps our caller-facing format name to n3's own format string. */
function n3FormatOf(format: RdfFormat): string {
  switch (format) {
    case 'turtle':
      return 'text/turtle';
    case 'ntriples':
      return 'application/n-triples';
    case 'nquads':
      return 'application/n-quads';
    case 'trig':
      return 'application/trig';
    default:
      throw new BoundsError(`unrecognized format "${format}"`);
  }
}

export interface ParsedDocument {
  quads: N3.Quad[];
  prefixes: Record<string, string>;
}

/** Parses RDF source text of the given format into quads + prefixes.
 * Applies the byte-size bound before parsing and the quad-count bound
 * incrementally while parsing (so a maliciously huge quad count aborts
 * without first materializing an oversized array). Rejects with
 * BoundsError or the underlying n3 parse error (both are plain Error
 * subclasses with a `.message`; n3's own parse errors additionally carry
 * `.context.line`).
 *
 * IMPORTANT: n3's Parser#parse delivers quads via its callback
 * ASYNCHRONOUSLY (each call is scheduled on a later tick, even for a
 * plain in-memory string, not invoked synchronously within the parse()
 * call) — this MUST be awaited; reading `quads`/`prefixes` immediately
 * after calling parser.parse() synchronously always observes them empty. */
export function parseRdf(text: string, format: RdfFormat, baseIRI?: string): Promise<ParsedDocument> {
  checkBytes(text, 'text', MAX_TEXT_BYTES);
  return new Promise((resolve, reject) => {
    const quads: N3.Quad[] = [];
    const prefixes: Record<string, string> = {};
    const parser = new N3.Parser({
      format: n3FormatOf(format),
      baseIRI: baseIRI || undefined,
      // Without this, n3 renames every blank node (even an explicitly
      // labeled one like "_:x") with a prefix from a MODULE-LEVEL, process-
      // lifetime counter that increments across every Parser instance ever
      // created — so parsing the identical document twice in the same
      // process yields DIFFERENT blank-node labels (e.g. "b12_x" then
      // "b13_x"), violating this package's own determinism claim. An empty
      // blankNodePrefix makes n3 use the document's raw blank-node labels
      // unmodified, which is what "same input -> same output" requires.
      blankNodePrefix: '',
    });
    let settled = false;
    parser.parse(
      text,
      (err, quad) => {
        if (settled) return; // already resolved/rejected; ignore further callbacks
        if (err) {
          settled = true;
          reject(err);
          return;
        }
        if (quad) {
          if (quads.length >= MAX_QUADS) {
            settled = true;
            reject(new BoundsError(`document exceeds ${MAX_QUADS} quads`));
            return;
          }
          quads.push(quad);
        } else {
          // n3 signals completion with a final (null, null) callback.
          settled = true;
          resolve({ quads, prefixes });
        }
      },
      (prefix: string, iri: N3.NamedNode) => {
        prefixes[prefix] = iri.value;
      }
    );
  });
}

/** Serializes quads (+ optional prefixes) into RDF source text of the given
 * format. Turtle uses prefixes to abbreviate output when supplied;
 * N-Triples/N-Quads ignore prefixes (those syntaxes have none). Returns a
 * Promise because N3.Writer's `end` callback is the only way to obtain the
 * result. */
export function serializeRdf(
  quads: N3.Quad[],
  format: RdfFormat,
  prefixes?: Record<string, string>
): Promise<string> {
  checkQuadCount(quads.length);
  return new Promise((resolve, reject) => {
    const options: N3.WriterOptions = { format: n3FormatOf(format) };
    if (format === 'turtle' && prefixes && Object.keys(prefixes).length > 0) {
      options.prefixes = prefixes;
    }
    const writer = new N3.Writer(options);
    for (const q of quads) {
      writer.addQuad(q);
    }
    writer.end((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/** Extracts a 1-based (line, column) from an n3 parse error's `.context`,
 * where available. n3 exposes `.context.line` (1-based) and
 * `.context.token.start` (0-based char offset of the token within its
 * line, NOT the document) - we treat start+1 as an approximate 1-based
 * column. Returns {line: 0, column: 0} when the error carries no context
 * (should not happen for n3's own errors, but defensive for anything
 * unexpected). */
export function extractErrorLocation(err: unknown): { line: number; column: number } {
  const e = err as { context?: { line?: number; token?: { start?: number } } };
  const line = e?.context?.line ?? 0;
  const column = typeof e?.context?.token?.start === 'number' ? e.context.token.start + 1 : 0;
  return { line, column };
}

// ---------------------------------------------------------------------------
// Deterministic ordering
// ---------------------------------------------------------------------------

const SORT_KEY_SEP = String.fromCharCode(31); // ASCII unit separator

function termSortKey(t: Term): string {
  // Unit-separator-joined key; RDF IRIs/literals/blank-node labels cannot
  // contain this control character in valid syntax, so this is
  // collision-safe.
  return [t.getTermType(), t.getValue(), t.getDatatype(), t.getLanguage()].join(SORT_KEY_SEP);
}

/** Same identity key as termSortKey, but tolerant of an absent (undefined)
 * Term - a proto message field that was simply never set deserializes to
 * undefined rather than a zero-value Term. Used by CountQuads/FilterQuads
 * to compare/deduplicate terms without first asserting presence. */
export function termSortKeyForCount(t: Term | undefined): string {
  if (!t) return termSortKey(new Term());
  return termSortKey(t);
}

/** Sorts proto Terms deterministically by (term_type, value, datatype,
 * language), independent of any input/appearance order. */
export function sortTerms(terms: Term[]): Term[] {
  return [...terms].sort((a, b) => {
    const ka = termSortKey(a);
    const kb = termSortKey(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/** Deduplicates proto Terms by their full (term_type, value, datatype,
 * language) identity, then sorts deterministically. */
export function distinctSortedTerms(terms: Term[]): Term[] {
  const seen = new Map<string, Term>();
  for (const t of terms) {
    const key = termSortKey(t);
    if (!seen.has(key)) seen.set(key, t);
  }
  return sortTerms([...seen.values()]);
}

// ---------------------------------------------------------------------------
// JSON-LD: network-disabled document loader
// ---------------------------------------------------------------------------

/** A jsonld.js documentLoader that unconditionally refuses to dereference
 * ANY url - the only way this package's JSON-LD nodes ever gain access to a
 * context or document is via the caller's own document_json/context_json
 * fields, never a live fetch. This eliminates the SSRF surface a JSON-LD
 * processor otherwise exposes (a caller-controlled "@context" string that
 * is a URL) and keeps every node a pure, deterministic, offline transform. */
export const noNetworkDocumentLoader = async (url: string): Promise<never> => {
  throw new Error(`remote document/context loading is disabled (rdf-tools is offline-only); refused to load "${url}"`);
};

/** Parses a JSON string with a byte-size bound applied first. Throws
 * BoundsError on oversized input or invalid JSON. */
export function parseJsonBounded(text: string, field: string): unknown {
  checkBytes(text, field, MAX_JSON_BYTES);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new BoundsError(`${field} is not valid JSON: ${errorMessage(e, 'parse')}`);
  }
}

export { jsonld };

// ---------------------------------------------------------------------------
// CURIE expand / compact
// ---------------------------------------------------------------------------

const CURIE_PATTERN = /^([A-Za-z_][\w.-]*):([^\s]*)$/;
// Recognize an absolute IRI (has a scheme, e.g. "http:", "urn:") so we don't
// misinterpret one as a "prefix:local" CURIE - an IRI's scheme is
// technically indistinguishable from a CURIE prefix by syntax alone, so we
// special-case the common absolute-IRI patterns (scheme followed by "//" or
// a small set of well-known non-slash schemes) before treating the text
// before the first colon as a candidate prefix.
function looksLikeAbsoluteIri(s: string): boolean {
  return /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(s) || /^urn:/i.test(s);
}

/** Expands a CURIE ("prefix:local") to a full IRI using a caller-supplied
 * prefix map. An already-absolute IRI, or a string with no matching
 * prefix, is returned unchanged with expanded=false. */
export function expandCurie(curie: string, prefixes: Record<string, string>): { iri: string; expanded: boolean } {
  if (looksLikeAbsoluteIri(curie)) {
    return { iri: curie, expanded: false };
  }
  const m = CURIE_PATTERN.exec(curie);
  if (!m) {
    return { iri: curie, expanded: false };
  }
  const [, prefix, local] = m;
  const ns = prefixes[prefix];
  if (ns === undefined) {
    return { iri: curie, expanded: false };
  }
  return { iri: ns + local, expanded: true };
}

/** Compacts a full IRI to "prefix:local" using the LONGEST matching
 * namespace IRI in the caller-supplied prefix map (so a more specific
 * prefix wins over a shorter one whose namespace is also a prefix of it).
 * Returns the IRI unchanged with compacted=false if no prefix matches. */
export function compactIri(
  iri: string,
  prefixes: Record<string, string>
): { curie: string; compacted: boolean; matchedPrefix: string } {
  let bestPrefix = '';
  let bestNs = '';
  for (const [prefix, ns] of Object.entries(prefixes)) {
    if (ns.length > 0 && iri.startsWith(ns) && ns.length > bestNs.length) {
      bestPrefix = prefix;
      bestNs = ns;
    }
  }
  if (!bestNs) {
    return { curie: iri, compacted: false, matchedPrefix: '' };
  }
  const local = iri.slice(bestNs.length);
  return { curie: `${bestPrefix}:${local}`, compacted: true, matchedPrefix: bestPrefix };
}

// ---------------------------------------------------------------------------
// QuadList <-> proto helpers used across nodes
// ---------------------------------------------------------------------------

/** Builds a proto QuadList from parsed rdfjs quads + prefixes. */
export function toQuadListProto(doc: ParsedDocument): QuadList {
  const out = new QuadList();
  out.setQuadsList(doc.quads.map(rdfQuadToProto));
  const map = out.getPrefixesMap();
  for (const [k, v] of Object.entries(doc.prefixes)) {
    map.set(k, v);
  }
  return out;
}

/** Converts a jspb.Map<string, string> (as returned by any *.getXMap()
 * accessor) into a plain Record for use with N3/jsonld/CURIE helpers. */
export function jspbMapToRecord(map: { toArray(): Array<[string, string]> }): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of map.toArray()) {
    out[k] = v;
  }
  return out;
}

/** Converts an array of proto Quad into rdfjs quads, applying the input
 * quad-count bound first. */
export function protoQuadsToRdf(quads: Quad[]): N3.Quad[] {
  checkQuadCount(quads.length);
  return quads.map(protoToRdfQuad);
}
