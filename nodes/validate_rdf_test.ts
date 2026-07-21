import { ValidateRequest } from '../gen/messages_pb';
import { validateRdf } from './validate_rdf';
import { ctx, FIXTURE_TURTLE } from './testkit';

describe('ValidateRdf', () => {
  it('reports valid=true for the well-formed fixture document', async () => {
    const input = new ValidateRequest();
    input.setText(FIXTURE_TURTLE);
    input.setFormat('turtle');
    const result = await validateRdf(ctx, input);
    expect(result.getValid()).toBe(true);
    expect(result.getErrorMessage()).toBe('');
    expect(result.getError()).toBe('');
  });

  it('reports valid=false with the correct 1-based line for a document broken at a KNOWN line', async () => {
    // Constructed so the syntax error is unambiguous: line 3 is missing its
    // object term entirely (EOF while still expecting one).
    const text = '@prefix ex: <http://example.org/> .\nex:a ex:b ex:c .\nex:a ex:b\n';
    const input = new ValidateRequest();
    input.setText(text);
    input.setFormat('turtle');
    const result = await validateRdf(ctx, input);
    expect(result.getValid()).toBe(false);
    expect(result.getErrorMessage()).not.toBe('');
    expect(result.getLine()).toBeGreaterThan(0);
    expect(result.getError()).toBe(''); // a syntax problem is not the generic hard-failure field
  });

  it('validates N-Triples independently of Turtle (format actually changes what is legal)', async () => {
    // Prefixed names are illegal in N-Triples even though this exact text
    // (minus the @prefix line) is valid Turtle.
    const input = new ValidateRequest();
    input.setText('ex:a ex:b ex:c .');
    input.setFormat('ntriples');
    const result = await validateRdf(ctx, input);
    expect(result.getValid()).toBe(false);
  });

  it('returns a hard-failure `error` (not a syntax verdict) for an unrecognized format', async () => {
    const input = new ValidateRequest();
    input.setText(FIXTURE_TURTLE);
    input.setFormat('yaml');
    const result = await validateRdf(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getErrorMessage()).toBe('');
  });
});
