import { QuadListInput } from '../gen/messages_pb';
import { getObjects } from './get_objects';
import { ctx, FIXTURE_QUADS } from './testkit';

describe('GetObjects', () => {
  it('returns the 4 hand-known distinct objects, each correctly typed', () => {
    const input = new QuadListInput();
    input.setQuadsList(FIXTURE_QUADS);
    const result = getObjects(ctx, input);
    expect(result.getError()).toBe('');
    const terms = result.getTermsList();
    expect(terms).toHaveLength(4); // bob, carol, "Alice"@en, "30"^^xsd:integer

    const iris = terms.filter((t) => t.getTermType() === 'NamedNode').map((t) => t.getValue());
    expect(iris.sort()).toEqual(['http://example.org/bob', 'http://example.org/carol']);

    const literals = terms.filter((t) => t.getTermType() === 'Literal');
    expect(literals).toHaveLength(2);
    const nameLit = literals.find((t) => t.getValue() === 'Alice')!;
    expect(nameLit.getLanguage()).toBe('en');
    const ageLit = literals.find((t) => t.getValue() === '30')!;
    expect(ageLit.getDatatype()).toBe('http://www.w3.org/2001/XMLSchema#integer');
  });

  it('handles an empty quad list', () => {
    const input = new QuadListInput();
    const result = getObjects(ctx, input);
    expect(result.getTermsList()).toHaveLength(0);
  });
});
