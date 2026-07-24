import { QuadListInput, TermList, Term } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { distinctSortedTerms, errorMessage } from './lib';

/**
 * Extract every DISTINCT object term across a quad list — a NamedNode
 * (IRI), BlankNode, or Literal (the only position a Literal can appear
 * in), each with term_type set so callers can distinguish an IRI, a blank
 * node, and a literal without inspecting the string, and — for a Literal
 * — its datatype/language so e.g. "30"^^xsd:integer and "30" (plain
 * string) count as two distinct objects. Deduplicated and sorted
 * deterministically by (term_type, value, datatype, language) —
 * independent of the quads' own order. Input capped at 1,000,000 quads.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function getObjects(ax: AxiomContext, input: QuadListInput): TermList {
  const out = new TermList();
  try {
    const quads = input.getQuadsList();
    const terms: Term[] = quads.map((q) => q.getObject()).filter((t): t is Term => !!t);
    out.setTermsList(distinctSortedTerms(terms));
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting objects'));
    return out;
  }
}
