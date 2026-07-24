import { JsonLdFromRdfRequest, JsonLdResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { jsonld, errorMessage } from './lib';

/**
 * Convert an N-Quads document to JSON-LD (the reverse of JsonLdToRdf) —
 * returns the EXPANDED JSON-LD form (one object per subject, every
 * predicate a full IRI key) since there is no context to compact against;
 * pipe result_json into JsonLdCompact with your own context if you want a
 * compact form instead. Every graph in the input becomes a top-level
 * "@graph" entry named by its graph IRI/blank-node id; default-graph
 * quads become top-level nodes directly. Malformed N-Quads returns a
 * structured error. Wraps jsonld.js (digitalbazaar/jsonld.js, BSD-3-Clause)
 * — this node performs no network I/O (fromRDF never dereferences
 * anything; there is no context to resolve).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function jsonLdFromRdf(ax: AxiomContext, input: JsonLdFromRdfRequest): Promise<JsonLdResult> {
  const out = new JsonLdResult();
  try {
    const nquads = input.getNquadsText();
    const expanded = await jsonld.fromRDF(nquads, { format: 'application/n-quads' });
    out.setResultJson(JSON.stringify(expanded));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'converting RDF to JSON-LD'));
    return out;
  }
}
