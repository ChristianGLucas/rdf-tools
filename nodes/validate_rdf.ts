import { ValidateRequest, ValidateResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseRdf, extractErrorLocation, errorMessage, RdfFormat, BoundsError } from './lib';

const VALID_FORMATS: ReadonlySet<string> = new Set(['turtle', 'ntriples', 'nquads', 'trig']);

/**
 * Check whether a document is well-formed RDF under the given syntax
 * (format: "turtle" | "ntriples" | "nquads" | "trig") — attempts a full
 * parse and reports valid=true iff it succeeds with zero errors. On a
 * syntax error, valid=false and error_message/line/column describe the
 * FIRST error encountered (a 1-based line, and a best-effort 1-based
 * column derived from the offending token's position within its line —
 * n3's parser does not track an absolute character column, only a
 * within-line token offset). Unlike the Parse* nodes, this never sets the
 * generic `error` field for a syntax problem — that field is reserved for
 * a hard failure unrelated to the document's own syntax (oversized input,
 * an unrecognized `format`). Input capped at 10 MiB / 1,000,000 quads.
 * Wraps n3 (rdfjs/N3.js, MIT).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function validateRdf(ax: AxiomContext, input: ValidateRequest): Promise<ValidateResult> {
  const out = new ValidateResult();
  const format = input.getFormat();
  if (!VALID_FORMATS.has(format)) {
    out.setError(errorMessage(new BoundsError(`unrecognized format "${format}"`), 'validating RDF'));
    return out;
  }
  try {
    await parseRdf(input.getText(), format as RdfFormat);
    out.setValid(true);
    return out;
  } catch (e) {
    if (e instanceof BoundsError) {
      // A hard failure (oversized input) is not a syntax verdict.
      out.setError(errorMessage(e, 'validating RDF'));
      return out;
    }
    out.setValid(false);
    out.setErrorMessage(e instanceof Error ? e.message : String(e));
    const { line, column } = extractErrorLocation(e);
    out.setLine(line);
    out.setColumn(column);
    return out;
  }
}
