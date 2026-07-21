import { CompactIriRequest } from '../gen/messages_pb';
import { compactIri } from './compact_iri';
import { ctx } from './testkit';

describe('CompactIri', () => {
  it('compacts a full IRI to prefix:local', () => {
    const input = new CompactIriRequest();
    input.setIri('http://xmlns.com/foaf/0.1/knows');
    input.getPrefixesMap().set('foaf', 'http://xmlns.com/foaf/0.1/');
    const result = compactIri(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getCompacted()).toBe(true);
    expect(result.getCurie()).toBe('foaf:knows');
    expect(result.getMatchedPrefix()).toBe('foaf');
  });

  it('picks the LONGEST matching namespace when more than one matches', () => {
    const input = new CompactIriRequest();
    input.setIri('http://example.org/vocab/Person');
    const map = input.getPrefixesMap();
    map.set('ex', 'http://example.org/');
    map.set('vocab', 'http://example.org/vocab/');
    const result = compactIri(ctx, input);
    expect(result.getCompacted()).toBe(true);
    expect(result.getMatchedPrefix()).toBe('vocab'); // more specific than "ex"
    expect(result.getCurie()).toBe('vocab:Person');
  });

  it('returns the IRI unchanged when no prefix matches (not an error)', () => {
    const input = new CompactIriRequest();
    input.setIri('http://unrelated.org/x');
    input.getPrefixesMap().set('ex', 'http://example.org/');
    const result = compactIri(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getCompacted()).toBe(false);
    expect(result.getCurie()).toBe('http://unrelated.org/x');
    expect(result.getMatchedPrefix()).toBe('');
  });

  it('round-trips with ExpandCurie for a compacted result', () => {
    const input = new CompactIriRequest();
    input.setIri('http://xmlns.com/foaf/0.1/knows');
    input.getPrefixesMap().set('foaf', 'http://xmlns.com/foaf/0.1/');
    const result = compactIri(ctx, input);
    expect(result.getCurie()).toBe('foaf:knows');
  });
});
