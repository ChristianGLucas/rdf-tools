import { ParseRequest, QuadList } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseRdf, toQuadListProto, errorMessage } from './lib';

/**
 * Parse a Turtle (text/turtle) document into a normalized list of quads
 * (every quad's graph is DefaultGraph — Turtle has no named-graph syntax)
 * plus the namespace prefixes declared in the document (@prefix). Relative
 * IRIs are resolved against base_iri when given, or the document's own
 * @base directive otherwise. Malformed Turtle returns a structured error
 * (never a crash) rather than a partial result — a Turtle syntax error can
 * invalidate the interpretation of everything already read (e.g. an
 * unterminated collection or blank-node property list), so an all-or-
 * nothing result is the only safe contract. Input is capped at 10 MiB and
 * 1,000,000 quads. Wraps n3 (rdfjs/N3.js, MIT).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function parseTurtle(ax: AxiomContext, input: ParseRequest): Promise<QuadList> {
  try {
    const doc = await parseRdf(input.getText(), 'turtle', input.getBaseIri());
    return toQuadListProto(doc);
  } catch (e) {
    const out = new QuadList();
    out.setError(errorMessage(e, 'parsing Turtle'));
    return out;
  }
}
