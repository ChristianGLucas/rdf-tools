import { QuadListInput, CountResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkQuadCount, termSortKeyForCount, errorMessage } from './lib';

/**
 * Count a quad list: total quads, total plain triples (quads whose graph
 * is the default graph), and the number of DISTINCT subjects, predicates,
 * objects, and named graphs (each term compared on its full identity —
 * term_type, value, and for a Literal also datatype/language, so
 * "Alice"@en and "Alice"@fr count as two distinct objects). Useful for a
 * quick size/shape summary of a document without materializing the full
 * distinct-term lists GetSubjects/GetPredicates/GetObjects/FilterQuads
 * would return. Input capped at 1,000,000 quads.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function countQuads(ax: AxiomContext, input: QuadListInput): CountResult {
  const out = new CountResult();
  try {
    const quads = input.getQuadsList();
    checkQuadCount(quads.length);
    const subjects = new Set<string>();
    const predicates = new Set<string>();
    const objects = new Set<string>();
    const graphs = new Set<string>();
    let triples = 0;
    for (const q of quads) {
      subjects.add(termSortKeyForCount(q.getSubject()));
      predicates.add(termSortKeyForCount(q.getPredicate()));
      objects.add(termSortKeyForCount(q.getObject()));
      const g = q.getGraph();
      if (g && g.getTermType() === 'DefaultGraph') {
        triples++;
      } else if (g) {
        graphs.add(termSortKeyForCount(g));
      }
    }
    out.setTotalQuads(quads.length);
    out.setTotalTriples(triples);
    out.setDistinctSubjects(subjects.size);
    out.setDistinctPredicates(predicates.size);
    out.setDistinctObjects(objects.size);
    out.setDistinctGraphs(graphs.size);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'counting quads'));
    return out;
  }
}
