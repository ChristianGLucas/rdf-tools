import { QuadListInput } from '../gen/messages_pb';
import { getPredicates } from './get_predicates';
import { ctx, FIXTURE_QUADS } from './testkit';

describe('GetPredicates', () => {
  it('returns the 3 hand-known distinct predicates, sorted by IRI', () => {
    const input = new QuadListInput();
    input.setQuadsList(FIXTURE_QUADS);
    const result = getPredicates(ctx, input);
    expect(result.getError()).toBe('');
    const values = result.getTermsList().map((t) => t.getValue());
    // Hand-derived: age < knows < name lexicographically.
    expect(values).toEqual([
      'http://xmlns.com/foaf/0.1/age',
      'http://xmlns.com/foaf/0.1/knows',
      'http://xmlns.com/foaf/0.1/name',
    ]);
    for (const t of result.getTermsList()) {
      expect(t.getTermType()).toBe('NamedNode'); // predicates are always IRIs
    }
  });

  it('handles an empty quad list', () => {
    const input = new QuadListInput();
    const result = getPredicates(ctx, input);
    expect(result.getTermsList()).toHaveLength(0);
  });
});
