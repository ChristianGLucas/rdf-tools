import { FilterRequest, QuadList, Quad, Term, TermFilter } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkQuadCount, termSortKeyForCount, errorMessage } from './lib';

function matches(filter: TermFilter | undefined, actual: Term | undefined): boolean {
  if (!filter || !filter.getHasValue()) return true; // wildcard
  return termSortKeyForCount(filter.getTerm()) === termSortKeyForCount(actual);
}

/**
 * Return every quad matching a set of per-position constraints — subject,
 * predicate, object, and/or graph — where an unset constraint (has_value =
 * false) matches anything (a wildcard) and a set constraint must equal
 * that position's term exactly (term_type, value, and for a Literal also
 * datatype/language). All given constraints combine with logical AND; a
 * request with every constraint unset returns every input quad unchanged.
 * Preserves the input list's order. This is the composable building block
 * behind "find every quad about X" / "find every quad using predicate P"
 * — construct the TermFilter you need and this node applies it in a
 * single pass. Input capped at 1,000,000 quads.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function filterQuads(ax: AxiomContext, input: FilterRequest): QuadList {
  const out = new QuadList();
  try {
    const quads = input.getQuadsList();
    checkQuadCount(quads.length);
    const subjectFilter = input.getSubject();
    const predicateFilter = input.getPredicate();
    const objectFilter = input.getObject();
    const graphFilter = input.getGraph();
    const result: Quad[] = quads.filter(
      (q) =>
        matches(subjectFilter, q.getSubject()) &&
        matches(predicateFilter, q.getPredicate()) &&
        matches(objectFilter, q.getObject()) &&
        matches(graphFilter, q.getGraph())
    );
    out.setQuadsList(result);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'filtering quads'));
    return out;
  }
}
