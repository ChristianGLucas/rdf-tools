import { ParseRequest } from '../gen/messages_pb';
import { parseNQuads } from './parse_n_quads';
import { ctx } from './testkit';

// Independent oracle: canonical N-Quads grammar, hand-transcribed.
const NQUADS_FIXTURE = `<http://example.org/alice> <http://xmlns.com/foaf/0.1/knows> <http://example.org/bob> <http://example.org/g1> .
<http://example.org/alice> <http://xmlns.com/foaf/0.1/name> "Alice"@en .
`;

describe('ParseNQuads', () => {
  it('parses a 4-term statement into a NamedNode graph and a 3-term statement into DefaultGraph', async () => {
    const input = new ParseRequest();
    input.setText(NQUADS_FIXTURE);
    const result = await parseNQuads(ctx, input);

    expect(result.getError()).toBe('');
    const quads = result.getQuadsList();
    expect(quads).toHaveLength(2);
    expect(result.getPrefixesMap().getLength()).toBe(0); // N-Quads has no prefix syntax

    expect(quads[0].getGraph()!.getTermType()).toBe('NamedNode');
    expect(quads[0].getGraph()!.getValue()).toBe('http://example.org/g1');

    expect(quads[1].getGraph()!.getTermType()).toBe('DefaultGraph');
  });

  it('rejects a relative IRI even when base_iri is supplied', async () => {
    const input = new ParseRequest();
    input.setText('<#a> <http://example.org/p> <http://example.org/o> .');
    input.setBaseIri('http://example.org/doc');
    const result = await parseNQuads(ctx, input);
    expect(result.getError()).not.toBe('');
  });

  it('returns a structured error on malformed N-Quads', async () => {
    const input = new ParseRequest();
    input.setText('not valid n-quads at all @@@\n');
    const result = await parseNQuads(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getQuadsList()).toHaveLength(0);
  });
});
