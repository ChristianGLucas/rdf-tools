import { QuadListInput, TermList, Term } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { checkQuadCount, distinctSortedTerms, errorMessage } from './lib';

/**
 * Extract every DISTINCT subject term across a quad list — a NamedNode
 * (IRI) or BlankNode, never a Literal (RDF disallows a literal subject) —
 * with term_type set so callers can tell an IRI from a blank node without
 * inspecting the string. Deduplicated and sorted deterministically by
 * (term_type, value) — independent of the quads' own order, so the same
 * set of subjects always serializes identically regardless of how the
 * source document ordered its statements. Input capped at 1,000,000 quads.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function getSubjects(ax: AxiomContext, input: QuadListInput): TermList {
  const out = new TermList();
  try {
    const quads = input.getQuadsList();
    checkQuadCount(quads.length);
    const terms: Term[] = quads.map((q) => q.getSubject()).filter((t): t is Term => !!t);
    out.setTermsList(distinctSortedTerms(terms));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting subjects'));
    return out;
  }
}
