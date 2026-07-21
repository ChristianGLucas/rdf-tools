import { ExpandCurieRequest } from '../gen/messages_pb';
import { expandCurie } from './expand_curie';
import { ctx, FIXTURE_PREFIXES } from './testkit';

describe('ExpandCurie', () => {
  it('expands a prefixed name against the prefix map', () => {
    const input = new ExpandCurieRequest();
    input.setCurie('foaf:knows');
    for (const [k, v] of Object.entries(FIXTURE_PREFIXES)) input.getPrefixesMap().set(k, v);
    const result = expandCurie(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getExpanded()).toBe(true);
    // Hand-derived: "http://xmlns.com/foaf/0.1/" + "knows"
    expect(result.getIri()).toBe('http://xmlns.com/foaf/0.1/knows');
  });

  it('passes an already-absolute IRI through unchanged', () => {
    const input = new ExpandCurieRequest();
    input.setCurie('http://example.org/alice');
    input.getPrefixesMap().set('ex', 'http://example.org/');
    const result = expandCurie(ctx, input);
    expect(result.getExpanded()).toBe(false);
    expect(result.getIri()).toBe('http://example.org/alice');
  });

  it('passes a CURIE with an unknown prefix through unchanged (not an error)', () => {
    const input = new ExpandCurieRequest();
    input.setCurie('unknown:thing');
    const result = expandCurie(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getExpanded()).toBe(false);
    expect(result.getIri()).toBe('unknown:thing');
  });

  it('recognizes a urn: IRI as already-absolute', () => {
    const input = new ExpandCurieRequest();
    input.setCurie('urn:isbn:0451450523');
    const result = expandCurie(ctx, input);
    expect(result.getExpanded()).toBe(false);
    expect(result.getIri()).toBe('urn:isbn:0451450523');
  });
});
