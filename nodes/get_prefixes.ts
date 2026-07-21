import { GetPrefixesRequest, PrefixResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseRdf, errorMessage, RdfFormat, BoundsError } from './lib';

const PREFIX_FORMATS: ReadonlySet<string> = new Set(['turtle', 'trig']);

/**
 * Extract the namespace prefixes (@prefix declarations) from a Turtle or
 * TriG document, without materializing its quads — useful when a caller
 * only needs the prefix map (e.g. to feed ExpandCurie/CompactIri) and not
 * the full parsed graph. format must be "turtle" or "trig" (the only two
 * syntaxes with prefix declarations); "ntriples"/"nquads" — which have no
 * prefix syntax — are rejected with a structured error rather than
 * silently returning an empty map, since requesting prefixes from a
 * format that cannot have any is more likely a caller mistake than an
 * intentional empty-result query. A document with zero @prefix
 * declarations returns an empty (not missing) map. Malformed input
 * returns a structured error. Input capped at 10 MiB. Wraps n3
 * (rdfjs/N3.js, MIT).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function getPrefixes(ax: AxiomContext, input: GetPrefixesRequest): Promise<PrefixResult> {
  const out = new PrefixResult();
  try {
    const format = input.getFormat();
    if (!PREFIX_FORMATS.has(format)) {
      throw new BoundsError(`unrecognized format "${format}" (expected turtle or trig)`);
    }
    const doc = await parseRdf(input.getText(), format as RdfFormat);
    const map = out.getPrefixesMap();
    for (const [k, v] of Object.entries(doc.prefixes)) {
      map.set(k, v);
    }
    return out;
  } catch (e) {
    out.setError(errorMessage(e, 'extracting prefixes'));
    return out;
  }
}
