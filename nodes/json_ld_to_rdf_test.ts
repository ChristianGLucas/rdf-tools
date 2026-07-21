import { JsonLdToRdfRequest } from '../gen/messages_pb';
import { jsonLdToRdf } from './json_ld_to_rdf';
import { ParseRequest } from '../gen/messages_pb';
import { parseNQuads } from './parse_n_quads';
import { ctx, JSONLD_FIXTURE_DOC } from './testkit';

describe('JsonLdToRdf', () => {
  it('converts the JSON-LD spec fixture to N-Quads containing the hand-derived triples', async () => {
    const input = new JsonLdToRdfRequest();
    input.setDocumentJson(JSON.stringify(JSONLD_FIXTURE_DOC));
    const result = await jsonLdToRdf(ctx, input);
    expect(result.getError()).toBe('');

    // Independently verify by re-parsing the N-Quads output with this
    // package's own ParseNQuads and checking the resulting quads directly
    // (not just string matching), plus a hand-derived triple count.
    const parseInput = new ParseRequest();
    parseInput.setText(result.getText());
    const parsed = await parseNQuads(ctx, parseInput);
    expect(parsed.getError()).toBe('');
    expect(parsed.getQuadsList()).toHaveLength(2); // name + homepage, hand-counted

    const nameQuad = parsed
      .getQuadsList()
      .find((q) => q.getPredicate()!.getValue() === 'http://schema.org/name')!;
    expect(nameQuad.getSubject()!.getValue()).toBe('http://example.org/people/alice');
    expect(nameQuad.getObject()!.getValue()).toBe('Alice');

    const urlQuad = parsed
      .getQuadsList()
      .find((q) => q.getPredicate()!.getValue() === 'http://schema.org/url')!;
    expect(urlQuad.getObject()!.getTermType()).toBe('NamedNode');
    expect(urlQuad.getObject()!.getValue()).toBe('http://alice.example.org/');
  });

  it('refuses a remote "@context" URL rather than fetching it', async () => {
    const input = new JsonLdToRdfRequest();
    input.setDocumentJson(JSON.stringify({ '@context': 'http://schema.org/', '@id': 'http://example.org/x', name: 'X' }));
    const result = await jsonLdToRdf(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getError().toLowerCase()).toContain('disabled');
  });

  it('returns a structured error on malformed JSON', async () => {
    const input = new JsonLdToRdfRequest();
    input.setDocumentJson('not json');
    const result = await jsonLdToRdf(ctx, input);
    expect(result.getError()).not.toBe('');
  });
});
