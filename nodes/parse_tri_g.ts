import { ParseRequest, QuadList } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseRdf, toQuadListProto, errorMessage } from './lib';

/**
 * Parse a TriG (application/trig) document into a normalized list of
 * quads — statements inside a "graphLabel { ... }" block get that block's
 * label as their graph term; statements outside any block get
 * DefaultGraph — plus the namespace prefixes declared in the document
 * (@prefix). Relative IRIs are resolved against base_iri when given, or
 * the document's own @base directive otherwise. Malformed TriG returns a
 * structured error (never a crash), never a partial result — same
 * all-or-nothing contract as ParseTurtle, for the same reason (a syntax
 * error can invalidate the interpretation of everything already read).
 * Input capped at 10 MiB and 1,000,000 quads. Wraps n3 (rdfjs/N3.js, MIT).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function parseTriG(ax: AxiomContext, input: ParseRequest): Promise<QuadList> {
  try {
    const doc = await parseRdf(input.getText(), 'trig', input.getBaseIri());
    return toQuadListProto(doc);
  } catch (e) {
    const out = new QuadList();
    out.setError(errorMessage(e, 'parsing TriG'));
    return out;
  }
}
