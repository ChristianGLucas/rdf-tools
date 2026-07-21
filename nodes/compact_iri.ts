import { CompactIriRequest, CompactIriResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { compactIri as compactIriImpl, jspbMapToRecord, errorMessage } from './lib';

/**
 * Compact a full IRI to a "prefix:local" CURIE using a caller-supplied
 * prefix map — a fixed lookup + longest-namespace-match, the inverse of
 * ExpandCurie. When more than one prefix's namespace IRI is a prefix of
 * `iri`, the LONGEST matching namespace wins (the most specific
 * compaction) — e.g. given both "http://example.org/" and
 * "http://example.org/vocab/" mapped, an iri under .../vocab/ compacts
 * against the longer, more specific one. iri with no matching prefix in
 * the map is returned UNCHANGED with compacted=false rather than an
 * error. This never fails on malformed input; error is reserved for an
 * internal fault.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function compactIri(ax: AxiomContext, input: CompactIriRequest): CompactIriResult {
  const out = new CompactIriResult();
  try {
    const prefixes = jspbMapToRecord(input.getPrefixesMap());
    const { curie, compacted, matchedPrefix } = compactIriImpl(input.getIri(), prefixes);
    out.setCurie(curie);
    out.setCompacted(compacted);
    out.setMatchedPrefix(matchedPrefix);
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'compacting IRI'));
    return out;
  }
}
