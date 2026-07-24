import { QuadListInput, TermList, Term } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { distinctSortedTerms, errorMessage } from './lib';

/**
 * Extract every DISTINCT predicate term across a quad list — always a
 * NamedNode (IRI); RDF disallows a blank node or literal predicate.
 * Deduplicated and sorted deterministically by IRI value — independent of
 * the quads' own order. Useful for a quick "what vocabulary/properties
 * does this document use" summary. Input capped at 1,000,000 quads.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function getPredicates(ax: AxiomContext, input: QuadListInput): TermList {
  const out = new TermList();
  try {
    const quads = input.getQuadsList();
    const terms: Term[] = quads.map((q) => q.getPredicate()).filter((t): t is Term => !!t);
    out.setTermsList(distinctSortedTerms(terms));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting predicates'));
    return out;
  }
}
