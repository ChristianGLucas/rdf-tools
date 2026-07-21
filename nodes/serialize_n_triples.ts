import { SerializeRequest, SerializeResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { protoQuadsToRdf, serializeRdf, errorMessage } from './lib';

/**
 * Serialize a quad list to N-Triples (application/n-triples) source text —
 * one absolute-IRI/blank-node/literal triple per line, no prefixes (the
 * `prefixes` field on SerializeRequest is ignored; N-Triples has no
 * abbreviation syntax). Quads carrying a NamedNode/BlankNode graph term
 * are written as plain triples (the graph is dropped) — use
 * SerializeNQuads to preserve it. Deterministic: given the same quads,
 * output is byte-identical across calls. Input capped at 1,000,000 quads.
 * Wraps n3 (rdfjs/N3.js, MIT).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function serializeNTriples(ax: AxiomContext, input: SerializeRequest): Promise<SerializeResult> {
  const out = new SerializeResult();
  try {
    const quads = protoQuadsToRdf(input.getQuadsList());
    out.setText(await serializeRdf(quads, 'ntriples'));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'serializing N-Triples'));
    return out;
  }
}
