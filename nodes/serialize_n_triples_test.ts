import { SerializeRequest } from '../gen/messages_pb';
import { serializeNTriples } from './serialize_n_triples';
import { ctx, mkQuad, iri, lit } from './testkit';

describe('SerializeNTriples', () => {
  it('matches the hand-derived canonical N-Triples grammar exactly', async () => {
    const q1 = mkQuad(
      iri('http://example.org/alice'),
      iri('http://xmlns.com/foaf/0.1/knows'),
      iri('http://example.org/bob')
    );
    const q2 = mkQuad(
      iri('http://example.org/alice'),
      iri('http://xmlns.com/foaf/0.1/name'),
      lit('Alice', { language: 'en' })
    );
    const input = new SerializeRequest();
    input.setQuadsList([q1, q2]);
    const result = await serializeNTriples(ctx, input);

    // INDEPENDENT ORACLE: the exact N-Triples canonical form, hand-written
    // per the W3C N-Triples grammar (one absolute-IRI triple per line,
    // literal quoted, language tag appended with "@").
    const expected =
      '<http://example.org/alice> <http://xmlns.com/foaf/0.1/knows> <http://example.org/bob> .\n' +
      '<http://example.org/alice> <http://xmlns.com/foaf/0.1/name> "Alice"@en .\n';
    expect(result.getError()).toBe('');
    expect(result.getText()).toBe(expected);
  });

  it('ignores prefixes entirely (N-Triples has no abbreviation syntax)', async () => {
    const input = new SerializeRequest();
    input.setQuadsList([mkQuad(iri('http://example.org/s'), iri('http://example.org/p'), iri('http://example.org/o'))]);
    input.getPrefixesMap().set('ex', 'http://example.org/');
    const result = await serializeNTriples(ctx, input);
    expect(result.getText()).toContain('<http://example.org/s>');
    expect(result.getText()).not.toContain('ex:');
  });

  it('is deterministic across calls', async () => {
    const input = new SerializeRequest();
    input.setQuadsList([mkQuad(iri('http://example.org/s'), iri('http://example.org/p'), iri('http://example.org/o'))]);
    const r1 = await serializeNTriples(ctx, input);
    const r2 = await serializeNTriples(ctx, input);
    expect(r1.getText()).toBe(r2.getText());
  });

  it('returns a structured error for an unrecognized term_type', async () => {
    const bad = iri('x');
    bad.setTermType('Bogus');
    const input = new SerializeRequest();
    input.setQuadsList([mkQuad(bad, iri('http://example.org/p'), iri('http://example.org/o'))]);
    const result = await serializeNTriples(ctx, input);
    expect(result.getError()).not.toBe('');
  });
});
