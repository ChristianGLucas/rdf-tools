import { ConvertRequest } from '../gen/messages_pb';
import { convertSyntax } from './convert_syntax';
import { ctx, FIXTURE_TURTLE } from './testkit';

describe('ConvertSyntax', () => {
  it('converts Turtle to N-Triples, preserving every triple', async () => {
    const input = new ConvertRequest();
    input.setText(FIXTURE_TURTLE);
    input.setFromFormat('turtle');
    input.setToFormat('ntriples');
    const result = await convertSyntax(ctx, input);

    expect(result.getError()).toBe('');
    const text = result.getText();
    // N-Triples has no prefixes: every term must be a full IRI now.
    expect(text).toContain('<http://example.org/alice>');
    expect(text).toContain('<http://xmlns.com/foaf/0.1/knows>');
    expect(text).toContain('<http://example.org/bob>');
    expect(text).toContain('<http://example.org/carol>');
    expect(text).toContain('"Alice"@en');
    expect(text).toContain('"30"^^<http://www.w3.org/2001/XMLSchema#integer>');
    // 4 statements in, 4 lines out (hand-counted from the fixture).
    expect(text.trim().split('\n')).toHaveLength(4);
  });

  it('converts N-Quads to Turtle, dropping the named graph but preserving the triple', async () => {
    const input = new ConvertRequest();
    input.setText('<http://example.org/s> <http://example.org/p> <http://example.org/o> <http://example.org/g> .\n');
    input.setFromFormat('nquads');
    input.setToFormat('turtle');
    const result = await convertSyntax(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getText()).toContain('http://example.org/s');
    expect(result.getText()).toContain('http://example.org/o');
  });

  it('rejects an unrecognized from_format', async () => {
    const input = new ConvertRequest();
    input.setText('anything');
    input.setFromFormat('yaml');
    input.setToFormat('turtle');
    const result = await convertSyntax(ctx, input);
    expect(result.getError()).toContain('from_format');
  });

  it('rejects an unrecognized to_format (including "trig", which this package cannot serialize)', async () => {
    const input = new ConvertRequest();
    input.setText(FIXTURE_TURTLE);
    input.setFromFormat('turtle');
    input.setToFormat('trig');
    const result = await convertSyntax(ctx, input);
    expect(result.getError()).toContain('to_format');
  });

  it('returns a structured error on malformed source text', async () => {
    const input = new ConvertRequest();
    input.setText('ex:a ex:b ex:c .'); // undefined prefix
    input.setFromFormat('turtle');
    input.setToFormat('ntriples');
    const result = await convertSyntax(ctx, input);
    expect(result.getError()).not.toBe('');
  });
});
