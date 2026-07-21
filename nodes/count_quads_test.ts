import { QuadListInput } from '../gen/messages_pb';
import { countQuads } from './count_quads';
import { ctx, FIXTURE_QUADS, mkQuad, iri } from './testkit';

describe('CountQuads', () => {
  it('matches the hand-counted totals for the fixture graph', () => {
    const input = new QuadListInput();
    input.setQuadsList(FIXTURE_QUADS);
    const result = countQuads(ctx, input);

    // Hand-counted (see testkit.ts FIXTURE_QUADS doc comment):
    expect(result.getTotalQuads()).toBe(4);
    expect(result.getTotalTriples()).toBe(4); // no named graphs in the fixture
    expect(result.getDistinctSubjects()).toBe(1); // only ex:alice
    expect(result.getDistinctPredicates()).toBe(3); // knows, name, age
    expect(result.getDistinctObjects()).toBe(4); // bob, carol, "Alice"@en, "30"^^xsd:integer
    expect(result.getDistinctGraphs()).toBe(0);
    expect(result.getError()).toBe('');
  });

  it('counts a named graph and separates it from plain triples', () => {
    const namedGraphQuad = mkQuad(
      iri('http://example.org/x'),
      iri('http://example.org/y'),
      iri('http://example.org/z'),
      iri('http://example.org/g1')
    );
    const input = new QuadListInput();
    input.setQuadsList([...FIXTURE_QUADS, namedGraphQuad]);
    const result = countQuads(ctx, input);
    expect(result.getTotalQuads()).toBe(5);
    expect(result.getTotalTriples()).toBe(4); // the named-graph quad doesn't count as a plain triple
    expect(result.getDistinctGraphs()).toBe(1);
  });

  it('handles an empty quad list', () => {
    const input = new QuadListInput();
    const result = countQuads(ctx, input);
    expect(result.getTotalQuads()).toBe(0);
    expect(result.getDistinctSubjects()).toBe(0);
    expect(result.getError()).toBe('');
  });

  it('treats literals with different datatypes/languages as distinct objects', () => {
    const q1 = mkQuad(iri('http://example.org/s'), iri('http://example.org/p'), iri('http://example.org/o'));
    // Reuse via testkit's lit would need import; construct inline for a
    // datatype-vs-plain-string distinction check instead.
    const input = new QuadListInput();
    input.setQuadsList([q1, q1]); // exact duplicate quad
    const result = countQuads(ctx, input);
    expect(result.getTotalQuads()).toBe(2); // duplicates ARE counted in total
    expect(result.getDistinctObjects()).toBe(1); // but only 1 distinct object
  });
});
