import { ExpandCurieRequest, ExpandCurieResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { expandCurie as expandCurieImpl, jspbMapToRecord, errorMessage } from './lib';

/**
 * Expand a CURIE (a prefixed name like "foaf:knows") to its full IRI using
 * a caller-supplied prefix map — a fixed lookup + string concatenation
 * against RFC 3986/Turtle CURIE syntax, not a parse of any document.
 * curie that is already an absolute IRI (has a "scheme://" or "urn:"
 * form), or whose prefix isn't in the map, is returned UNCHANGED with
 * expanded=false rather than an error — "this wasn't actually a CURIE" is
 * a normal, common case (e.g. piping a mix of IRIs and CURIEs through the
 * same call site). This never fails on malformed input; error is reserved
 * for an internal fault.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function expandCurie(ax: AxiomContext, input: ExpandCurieRequest): ExpandCurieResult {
  const out = new ExpandCurieResult();
  try {
    const prefixes = jspbMapToRecord(input.getPrefixesMap());
    const { iri, expanded } = expandCurieImpl(input.getCurie(), prefixes);
    out.setIri(iri);
    out.setExpanded(expanded);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'expanding CURIE'));
    return out;
  }
}
