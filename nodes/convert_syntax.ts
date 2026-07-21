import { ConvertRequest, SerializeResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseRdf, serializeRdf, errorMessage, RdfFormat, BoundsError } from './lib';

const TO_FORMATS: ReadonlySet<string> = new Set(['turtle', 'ntriples', 'nquads']);
const FROM_FORMATS: ReadonlySet<string> = new Set(['turtle', 'ntriples', 'nquads', 'trig']);

/**
 * Convert an RDF document from one syntax to another in a single call —
 * parses `text` as `from_format` then serializes the result as
 * `to_format`, preserving every triple/quad exactly (equivalent to
 * ParseX followed by SerializeY, offered as one call for convenience).
 * from_format is any of "turtle" | "ntriples" | "nquads" | "trig";
 * to_format is "turtle" | "ntriples" | "nquads" (this package exposes no
 * TriG serializer, so TriG is never a valid to_format). Converting FROM a
 * format that carries named graphs (nquads, trig) TO one that does not
 * (turtle, ntriples) silently drops the graph information on each such
 * quad, same as SerializeTurtle/SerializeNTriples — the triples
 * themselves are still preserved. Turtle output uses the source
 * document's own declared prefixes, when converting from turtle/trig; a
 * source in ntriples/nquads has none to carry over, so Turtle output in
 * that case uses full IRIs throughout. An unrecognized from_format/
 * to_format, or a malformed source document, returns a structured error.
 * Input capped at 10 MiB / 1,000,000 quads. Wraps n3 (rdfjs/N3.js, MIT).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function convertSyntax(ax: AxiomContext, input: ConvertRequest): Promise<SerializeResult> {
  const out = new SerializeResult();
  try {
    const fromFormat = input.getFromFormat();
    const toFormat = input.getToFormat();
    if (!FROM_FORMATS.has(fromFormat)) {
      throw new BoundsError(`unrecognized from_format "${fromFormat}" (expected turtle, ntriples, nquads, or trig)`);
    }
    if (!TO_FORMATS.has(toFormat)) {
      throw new BoundsError(`unrecognized to_format "${toFormat}" (expected turtle, ntriples, or nquads)`);
    }
    const doc = await parseRdf(input.getText(), fromFormat as RdfFormat, input.getBaseIri());
    out.setText(await serializeRdf(doc.quads, toFormat as RdfFormat, doc.prefixes));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'converting RDF syntax'));
    return out;
  }
}
