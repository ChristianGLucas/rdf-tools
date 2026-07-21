import { GetPrefixesRequest } from '../gen/messages_pb';
import { getPrefixes } from './get_prefixes';
import { ctx, FIXTURE_TURTLE, FIXTURE_PREFIXES } from './testkit';

describe('GetPrefixes', () => {
  it('extracts the 2 hand-known prefixes from the fixture Turtle document', async () => {
    const input = new GetPrefixesRequest();
    input.setText(FIXTURE_TURTLE);
    input.setFormat('turtle');
    const result = await getPrefixes(ctx, input);
    expect(result.getError()).toBe('');
    const map = Object.fromEntries(result.getPrefixesMap().toArray());
    expect(map).toEqual(FIXTURE_PREFIXES);
  });

  it('returns an empty map for a document with zero @prefix declarations', async () => {
    const input = new GetPrefixesRequest();
    input.setText('<http://example.org/a> <http://example.org/b> <http://example.org/c> .');
    input.setFormat('turtle');
    const result = await getPrefixes(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getPrefixesMap().getLength()).toBe(0);
  });

  it('rejects ntriples/nquads with a structured error (they have no prefix syntax)', async () => {
    const input = new GetPrefixesRequest();
    input.setText('<http://example.org/a> <http://example.org/b> <http://example.org/c> .');
    input.setFormat('ntriples');
    const result = await getPrefixes(ctx, input);
    expect(result.getError()).toContain('format');
  });

  it('returns a structured error on malformed Turtle', async () => {
    const input = new GetPrefixesRequest();
    input.setText('ex:a ex:b ex:c .'); // undefined prefix
    input.setFormat('turtle');
    const result = await getPrefixes(ctx, input);
    expect(result.getError()).not.toBe('');
  });
});
