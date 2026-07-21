import { SerializeRequest } from '../gen/messages_pb';
import { serializeNQuads } from './serialize_n_quads';
import { ctx, mkQuad, iri, lit } from './testkit';

describe('SerializeNQuads', () => {
  it('matches the hand-derived canonical N-Quads grammar exactly, preserving the named graph', async () => {
    const q1 = mkQuad(
      iri('http://example.org/alice'),
      iri('http://xmlns.com/foaf/0.1/knows'),
      iri('http://example.org/bob'),
      iri('http://example.org/g1')
    );
    const q2 = mkQuad(
      iri('http://example.org/alice'),
      iri('http://xmlns.com/foaf/0.1/name'),
      lit('Alice', { language: 'en' })
      // graph omitted -> DEFAULT_GRAPH
    );
    const input = new SerializeRequest();
    input.setQuadsList([q1, q2]);
    const result = await serializeNQuads(ctx, input);

    // INDEPENDENT ORACLE: canonical N-Quads grammar, hand-written - a
    // 4th term on the line whose graph is a NamedNode, omitted for the
    // DefaultGraph line.
    const expected =
      '<http://example.org/alice> <http://xmlns.com/foaf/0.1/knows> <http://example.org/bob> <http://example.org/g1> .\n' +
      '<http://example.org/alice> <http://xmlns.com/foaf/0.1/name> "Alice"@en .\n';
    expect(result.getError()).toBe('');
    expect(result.getText()).toBe(expected);
  });

  it('is deterministic across calls', async () => {
    const input = new SerializeRequest();
    input.setQuadsList([mkQuad(iri('http://example.org/s'), iri('http://example.org/p'), iri('http://example.org/o'))]);
    const r1 = await serializeNQuads(ctx, input);
    const r2 = await serializeNQuads(ctx, input);
    expect(r1.getText()).toBe(r2.getText());
  });

  it('returns a structured error for an unrecognized term_type', async () => {
    const bad = iri('x');
    bad.setTermType('Bogus');
    const input = new SerializeRequest();
    input.setQuadsList([mkQuad(bad, iri('http://example.org/p'), iri('http://example.org/o'))]);
    const result = await serializeNQuads(ctx, input);
    expect(result.getError()).not.toBe('');
  });
});
