import { JsonLdToRdfRequest, SerializeResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { jsonld, noNetworkDocumentLoader, parseJsonBounded, jsonLdErrorMessage } from './lib';

/**
 * Convert a JSON-LD document to RDF, returned as N-Quads source text (feed
 * it into ParseNQuads to get this package's own QuadList form, e.g. to
 * then CountQuads/FilterQuads/GetSubjects on it, or SerializeTurtle after
 * a round-trip). context_json is used ONLY when document_json has no
 * "@context" of its own — same semantics as JsonLdExpand.context_json.
 * OFFLINE BY CONSTRUCTION: this node's document loader unconditionally
 * refuses any URL — a "@context" that is (or contains) a URL string fails
 * with a structured error rather than being fetched; supply the context's
 * actual contents inline instead. A JSON-LD document with no way to
 * resolve its terms to IRIs (no context at all, and none supplied) simply
 * produces no valid triples for those terms per the JSON-LD spec, not an
 * error. Malformed JSON, or a document jsonld.js itself rejects, returns
 * a structured error. Input capped at 10 MiB / 1,000,000 quads. Wraps
 * jsonld.js (digitalbazaar/jsonld.js, BSD-3-Clause).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function jsonLdToRdf(ax: AxiomContext, input: JsonLdToRdfRequest): Promise<SerializeResult> {
  const out = new SerializeResult();
  try {
    const document = parseJsonBounded(input.getDocumentJson(), 'document_json');
    const contextJson = input.getContextJson();
    const options: Record<string, unknown> = {
      format: 'application/n-quads',
      documentLoader: noNetworkDocumentLoader,
    };
    if (contextJson) {
      options.expandContext = parseJsonBounded(contextJson, 'context_json');
    }
    const nquads = await jsonld.toRDF(document, options);
    out.setText(nquads as string);
    return out;
  } catch (e) {
    out.setError(jsonLdErrorMessage(e, 'converting JSON-LD to RDF'));
    return out;
  }
}
