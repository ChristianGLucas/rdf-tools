import { ParseRequest } from '../gen/messages_pb';
import { parseTriG } from './parse_tri_g';
import { ctx } from './testkit';

// Independent oracle: TriG grammar with one graph block and one bare
// (default-graph) statement, hand-transcribed.
const TRIG_FIXTURE = `@prefix ex: <http://example.org/> .
ex:g1 { ex:alice ex:knows ex:bob . }
ex:alice ex:knows ex:carol .
`;

describe('ParseTriG', () => {
  it('assigns the graph block label to statements inside it, and DefaultGraph to bare statements', async () => {
    const input = new ParseRequest();
    input.setText(TRIG_FIXTURE);
    const result = await parseTriG(ctx, input);

    expect(result.getError()).toBe('');
    const quads = result.getQuadsList();
    expect(quads).toHaveLength(2);

    const inGraph = quads.find((q) => q.getObject()!.getValue() === 'http://example.org/bob')!;
    expect(inGraph.getGraph()!.getTermType()).toBe('NamedNode');
    expect(inGraph.getGraph()!.getValue()).toBe('http://example.org/g1');

    const bare = quads.find((q) => q.getObject()!.getValue() === 'http://example.org/carol')!;
    expect(bare.getGraph()!.getTermType()).toBe('DefaultGraph');

    const prefixMap = Object.fromEntries(result.getPrefixesMap().toArray());
    expect(prefixMap).toEqual({ ex: 'http://example.org/' });
  });

  it('resolves a relative IRI against base_iri', async () => {
    const input = new ParseRequest();
    input.setText('<#g1> { <#a> <#p> <#o> . }');
    input.setBaseIri('http://example.org/doc');
    const result = await parseTriG(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getQuadsList()[0].getGraph()!.getValue()).toBe('http://example.org/doc#g1');
  });

  it('returns a structured error on malformed TriG', async () => {
    const input = new ParseRequest();
    input.setText('ex:g1 { ex:alice ex:knows ex:bob . '); // unterminated block
    const result = await parseTriG(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getQuadsList()).toHaveLength(0);
  });
});
