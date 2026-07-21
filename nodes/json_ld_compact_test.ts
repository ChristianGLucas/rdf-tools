import { JsonLdCompactRequest } from '../gen/messages_pb';
import { jsonLdCompact } from './json_ld_compact';
import { ctx, JSONLD_FIXTURE_EXPANDED } from './testkit';

describe('JsonLdCompact', () => {
  it('compacts the expanded fixture back to short terms using a supplied context', async () => {
    const context = { name: 'http://schema.org/name', homepage: { '@id': 'http://schema.org/url', '@type': '@id' } };
    const input = new JsonLdCompactRequest();
    input.setDocumentJson(JSON.stringify(JSONLD_FIXTURE_EXPANDED));
    input.setContextJson(JSON.stringify(context));
    const result = await jsonLdCompact(ctx, input);
    expect(result.getError()).toBe('');
    const compacted = JSON.parse(result.getResultJson());
    expect(compacted.name).toBe('Alice');
    expect(compacted.homepage).toBe('http://alice.example.org/');
    expect(compacted['@context']).toEqual(context);
  });

  it('requires context_json', async () => {
    const input = new JsonLdCompactRequest();
    input.setDocumentJson(JSON.stringify(JSONLD_FIXTURE_EXPANDED));
    const result = await jsonLdCompact(ctx, input);
    expect(result.getError()).toContain('context_json');
  });

  it('refuses a remote context URL rather than fetching it', async () => {
    const input = new JsonLdCompactRequest();
    input.setDocumentJson(JSON.stringify(JSONLD_FIXTURE_EXPANDED));
    input.setContextJson(JSON.stringify('http://schema.org/'));
    const result = await jsonLdCompact(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getError().toLowerCase()).toContain('disabled');
  });
});
