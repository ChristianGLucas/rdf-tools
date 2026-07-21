import { JsonLdExpandRequest } from '../gen/messages_pb';
import { jsonLdExpand } from './json_ld_expand';
import { ctx, JSONLD_FIXTURE_DOC, JSONLD_FIXTURE_EXPANDED } from './testkit';

describe('JsonLdExpand', () => {
  it('expands the JSON-LD spec fixture example to its hand-computed expanded form', async () => {
    const input = new JsonLdExpandRequest();
    input.setDocumentJson(JSON.stringify(JSONLD_FIXTURE_DOC));
    const result = await jsonLdExpand(ctx, input);
    expect(result.getError()).toBe('');
    expect(JSON.parse(result.getResultJson())).toEqual(JSONLD_FIXTURE_EXPANDED);
  });

  it('uses context_json only when the document has no @context of its own', async () => {
    const input = new JsonLdExpandRequest();
    input.setDocumentJson(JSON.stringify({ '@id': 'http://example.org/x', name: 'X' }));
    input.setContextJson(JSON.stringify({ name: 'http://schema.org/name' }));
    const result = await jsonLdExpand(ctx, input);
    expect(result.getError()).toBe('');
    expect(JSON.parse(result.getResultJson())).toEqual([
      { '@id': 'http://example.org/x', 'http://schema.org/name': [{ '@value': 'X' }] },
    ]);
  });

  it('refuses a remote "@context" URL rather than fetching it (offline by construction)', async () => {
    const input = new JsonLdExpandRequest();
    input.setDocumentJson(JSON.stringify({ '@context': 'http://schema.org/', '@id': 'http://example.org/x', name: 'X' }));
    const result = await jsonLdExpand(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getError().toLowerCase()).toContain('disabled');
  });

  it('returns a structured error on malformed JSON', async () => {
    const input = new JsonLdExpandRequest();
    input.setDocumentJson('{not valid json');
    const result = await jsonLdExpand(ctx, input);
    expect(result.getError()).not.toBe('');
  });
});
