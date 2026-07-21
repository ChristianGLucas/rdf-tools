import { QuadListInput } from '../gen/messages_pb';
import { getSubjects } from './get_subjects';
import { ctx, FIXTURE_QUADS, mkQuad, iri } from './testkit';

describe('GetSubjects', () => {
  it('returns the single distinct subject in the fixture graph', () => {
    const input = new QuadListInput();
    input.setQuadsList(FIXTURE_QUADS);
    const result = getSubjects(ctx, input);
    expect(result.getError()).toBe('');
    const terms = result.getTermsList();
    expect(terms).toHaveLength(1);
    expect(terms[0].getTermType()).toBe('NamedNode');
    expect(terms[0].getValue()).toBe('http://example.org/alice');
  });

  it('deduplicates and sorts independent of input order', () => {
    const a = mkQuad(iri('http://example.org/z'), iri('http://example.org/p'), iri('http://example.org/o'));
    const b = mkQuad(iri('http://example.org/a'), iri('http://example.org/p'), iri('http://example.org/o'));
    const bDup = mkQuad(iri('http://example.org/a'), iri('http://example.org/p2'), iri('http://example.org/o'));

    const input1 = new QuadListInput();
    input1.setQuadsList([a, b, bDup]);
    const input2 = new QuadListInput();
    input2.setQuadsList([bDup, b, a]); // reversed order

    const r1 = getSubjects(ctx, input1).getTermsList().map((t) => t.getValue());
    const r2 = getSubjects(ctx, input2).getTermsList().map((t) => t.getValue());

    expect(r1).toEqual(['http://example.org/a', 'http://example.org/z']); // sorted, deduplicated
    expect(r2).toEqual(r1); // order-independent
  });

  it('handles an empty quad list', () => {
    const input = new QuadListInput();
    const result = getSubjects(ctx, input);
    expect(result.getTermsList()).toHaveLength(0);
    expect(result.getError()).toBe('');
  });
});
