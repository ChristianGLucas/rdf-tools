import { ParseRequest, QuadList } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseRdf, toQuadListProto, errorMessage } from './lib';

/**
 * Parse an N-Triples (application/n-triples) document into a normalized
 * list of quads (every quad's graph is DefaultGraph — N-Triples has no
 * named-graph syntax). N-Triples has no prefix syntax, so prefixes is
 * always empty. Per spec, N-Triples requires every IRI to be absolute —
 * base_iri is accepted for a uniform signature with the other Parse* nodes
 * but is NEVER used to resolve a relative IRI here; a relative IRI is a
 * parse error regardless. Malformed input returns a structured error
 * (never a crash), never a partial result. Input capped at 10 MiB and
 * 1,000,000 quads. Wraps n3 (rdfjs/N3.js, MIT).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function parseNTriples(ax: AxiomContext, input: ParseRequest): Promise<QuadList> {
  try {
    const doc = await parseRdf(input.getText(), 'ntriples', input.getBaseIri());
    return toQuadListProto(doc);
  } catch (e) {
    const out = new QuadList();
    out.setError(errorMessage(e, 'parsing N-Triples'));
    return out;
  }
}
