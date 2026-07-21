import { JsonLdFromRdfRequest } from '../gen/messages_pb';
import { jsonLdFromRdf } from './json_ld_from_rdf';
import { ctx } from './testkit';

describe('JsonLdFromRdf', () => {
  it('converts N-Quads to the expanded JSON-LD form (independent oracle: hand-derived expanded shape)', async () => {
    const nquads =
      '<http://example.org/alice> <http://schema.org/name> "Alice" .\n' +
      '<http://example.org/alice> <http://schema.org/url> <http://alice.example.org/> .\n';
    const input = new JsonLdFromRdfRequest();
    input.setNquadsText(nquads);
    const result = await jsonLdFromRdf(ctx, input);
    expect(result.getError()).toBe('');
    const parsed = JSON.parse(result.getResultJson());
    expect(parsed).toEqual([
      {
        '@id': 'http://example.org/alice',
        'http://schema.org/name': [{ '@value': 'Alice' }],
        'http://schema.org/url': [{ '@id': 'http://alice.example.org/' }],
      },
    ]);
  });

  it('is a pure inverse of JsonLdToRdf on a round trip (self-consistency, supplementary check)', async () => {
    const nquads = '<http://example.org/s> <http://example.org/p> "hello" .\n';
    const input = new JsonLdFromRdfRequest();
    input.setNquadsText(nquads);
    const result = await jsonLdFromRdf(ctx, input);
    const parsed = JSON.parse(result.getResultJson());
    expect(parsed[0]['http://example.org/p'][0]['@value']).toBe('hello');
  });

  it('returns a structured error on malformed N-Quads', async () => {
    const input = new JsonLdFromRdfRequest();
    input.setNquadsText('this is not n-quads at all');
    const result = await jsonLdFromRdf(ctx, input);
    expect(result.getError()).not.toBe('');
  });

  it('rejects oversized input', async () => {
    const input = new JsonLdFromRdfRequest();
    input.setNquadsText('x'.repeat(10_000_001));
    const result = await jsonLdFromRdf(ctx, input);
    expect(result.getError()).toContain('exceeds');
  });
});
