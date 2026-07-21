import { SerializeRequest, SerializeResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { protoQuadsToRdf, serializeRdf, errorMessage } from './lib';

/**
 * Serialize a quad list to N-Quads (application/n-quads) source text — one
 * absolute-IRI/blank-node/literal quad per line, with a 4th (graph) term
 * on lines whose graph is a NamedNode/BlankNode and omitted for
 * DefaultGraph quads. No prefixes (the `prefixes` field on
 * SerializeRequest is ignored; N-Quads has no abbreviation syntax). This
 * is the only Serialize* node in this package that round-trips a named
 * graph. Deterministic: given the same quads, output is byte-identical
 * across calls. Input capped at 1,000,000 quads. Wraps n3 (rdfjs/N3.js,
 * MIT).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function serializeNQuads(ax: AxiomContext, input: SerializeRequest): Promise<SerializeResult> {
  const out = new SerializeResult();
  try {
    const quads = protoQuadsToRdf(input.getQuadsList());
    out.setText(await serializeRdf(quads, 'nquads'));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'serializing N-Quads'));
    return out;
  }
}
