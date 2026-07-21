import { FilterRequest, TermFilter } from '../gen/messages_pb';
import { filterQuads } from './filter_quads';
import { ctx, FIXTURE_QUADS, iri } from './testkit';

function setFilter(target: TermFilter, term: ReturnType<typeof iri>): TermFilter {
  target.setHasValue(true);
  target.setTerm(term);
  return target;
}

describe('FilterQuads', () => {
  it('returns every quad unchanged when no constraint is set (all wildcards)', () => {
    const input = new FilterRequest();
    input.setQuadsList(FIXTURE_QUADS);
    const result = filterQuads(ctx, input);
    expect(result.getQuadsList()).toHaveLength(FIXTURE_QUADS.length);
    expect(result.getQuadsList()).toEqual(FIXTURE_QUADS); // preserves order
  });

  it('filters by predicate: foaf:knows matches exactly the 2 hand-known quads', () => {
    const input = new FilterRequest();
    input.setQuadsList(FIXTURE_QUADS);
    input.setPredicate(setFilter(new TermFilter(), iri('http://xmlns.com/foaf/0.1/knows')));
    const result = filterQuads(ctx, input);
    expect(result.getQuadsList()).toHaveLength(2);
    for (const q of result.getQuadsList()) {
      expect(q.getPredicate()!.getValue()).toBe('http://xmlns.com/foaf/0.1/knows');
    }
  });

  it('filters by object: ex:bob matches exactly 1 quad', () => {
    const input = new FilterRequest();
    input.setQuadsList(FIXTURE_QUADS);
    input.setObject(setFilter(new TermFilter(), iri('http://example.org/bob')));
    const result = filterQuads(ctx, input);
    expect(result.getQuadsList()).toHaveLength(1);
    expect(result.getQuadsList()[0].getObject()!.getValue()).toBe('http://example.org/bob');
  });

  it('ANDs multiple constraints together', () => {
    const input = new FilterRequest();
    input.setQuadsList(FIXTURE_QUADS);
    input.setPredicate(setFilter(new TermFilter(), iri('http://xmlns.com/foaf/0.1/knows')));
    input.setObject(setFilter(new TermFilter(), iri('http://example.org/carol')));
    const result = filterQuads(ctx, input);
    expect(result.getQuadsList()).toHaveLength(1);
  });

  it('returns an empty list when nothing matches', () => {
    const input = new FilterRequest();
    input.setQuadsList(FIXTURE_QUADS);
    input.setSubject(setFilter(new TermFilter(), iri('http://example.org/nobody')));
    const result = filterQuads(ctx, input);
    expect(result.getQuadsList()).toHaveLength(0);
  });
});
