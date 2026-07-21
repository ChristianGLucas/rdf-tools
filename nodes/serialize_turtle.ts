import { SerializeRequest, SerializeResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { protoQuadsToRdf, jspbMapToRecord, serializeRdf, errorMessage } from './lib';

/**
 * Serialize a quad list to Turtle (text/turtle) source text. `prefixes`
 * (prefix -> IRI) abbreviates matching IRIs as "prefix:local" in the
 * output; a quad whose subject/predicate/object IRI matches none of the
 * given prefixes is written as a full "<...>" IRI. Quads carrying a
 * NamedNode/BlankNode graph term are written as if they were in the
 * default graph (Turtle has no named-graph syntax) — use SerializeNQuads
 * to preserve the graph, or ConvertSyntax with to_format "turtle" if you
 * intend the graph information to be dropped for a Turtle audience.
 * Deterministic: given the same quads and prefixes, output is byte-
 * identical across calls (no wall-clock or random blank-node relabeling —
 * n3's Writer emits blank nodes by their own stable label). Input capped
 * at 1,000,000 quads. Wraps n3 (rdfjs/N3.js, MIT).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function serializeTurtle(ax: AxiomContext, input: SerializeRequest): Promise<SerializeResult> {
  const out = new SerializeResult();
  try {
    const quads = protoQuadsToRdf(input.getQuadsList());
    const prefixes = jspbMapToRecord(input.getPrefixesMap());
    out.setText(await serializeRdf(quads, 'turtle', prefixes));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'serializing Turtle'));
    return out;
  }
}
