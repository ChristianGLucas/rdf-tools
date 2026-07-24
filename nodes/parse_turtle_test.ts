import { ParseRequest } from '../gen/messages_pb';
import { parseTurtle } from './parse_turtle';
import { ctx, FIXTURE_TURTLE, FIXTURE_PREFIXES } from './testkit';

describe('ParseTurtle', () => {
  it('parses the fixture document into the hand-derived quad set and prefixes', async () => {
    const input = new ParseRequest();
    input.setText(FIXTURE_TURTLE);
    const result = await parseTurtle(ctx, input);

    expect(result.getError()).toBe('');
    const quads = result.getQuadsList();
    expect(quads).toHaveLength(4); // hand-counted: comma-list expands to 2 + 2 more statements

    for (const q of quads) {
      expect(q.getGraph()!.getTermType()).toBe('DefaultGraph');
    }

    const knowsObjects = quads
      .filter((q) => q.getPredicate()!.getValue() === 'http://xmlns.com/foaf/0.1/knows')
      .map((q) => q.getObject()!.getValue())
      .sort();
    expect(knowsObjects).toEqual(['http://example.org/bob', 'http://example.org/carol']);

    const nameQuad = quads.find((q) => q.getPredicate()!.getValue() === 'http://xmlns.com/foaf/0.1/name')!;
    expect(nameQuad.getObject()!.getTermType()).toBe('Literal');
    expect(nameQuad.getObject()!.getValue()).toBe('Alice');
    expect(nameQuad.getObject()!.getLanguage()).toBe('en');

    const ageQuad = quads.find((q) => q.getPredicate()!.getValue() === 'http://xmlns.com/foaf/0.1/age')!;
    expect(ageQuad.getObject()!.getDatatype()).toBe('http://www.w3.org/2001/XMLSchema#integer');
    expect(ageQuad.getObject()!.getValue()).toBe('30');

    const prefixMap = Object.fromEntries(result.getPrefixesMap().toArray());
    expect(prefixMap).toEqual(FIXTURE_PREFIXES);
  });

  it('resolves a relative IRI against base_iri', async () => {
    const input = new ParseRequest();
    input.setText('<#alice> <#knows> <#bob> .');
    input.setBaseIri('http://example.org/doc');
    const result = await parseTurtle(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getQuadsList()).toHaveLength(1);
    expect(result.getQuadsList()[0].getSubject()!.getValue()).toBe('http://example.org/doc#alice');
  });

  it('returns a structured error (never a partial result) on malformed Turtle', async () => {
    const input = new ParseRequest();
    // Undefined prefix "ex:" is never declared - a genuine Turtle syntax error.
    input.setText('ex:alice ex:knows ex:bob .');
    const result = await parseTurtle(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getQuadsList()).toHaveLength(0);
  });

  it('handles a large (multi-MB) well-formed input without crashing', async () => {
    const input = new ParseRequest();
    input.setText('<http://example.org/s> <http://example.org/p> "' + 'x'.repeat(10_000_001) + '" .');
    const result = await parseTurtle(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getQuadsList()).toHaveLength(1);
  });

  it('assigns the SAME blank-node label across repeated calls with identical input (determinism)', async () => {
    // Regression test: n3's Parser renames blank nodes using a MODULE-LEVEL,
    // process-lifetime counter by default (a fresh prefix per Parser
    // instance), so without blankNodePrefix: '' in lib.ts's parseRdf, this
    // exact same input previously produced a DIFFERENT label ("b12_x" then
    // "b13_x") on each successive call within the same process - a real
    // violation of this package's own "deterministic... no randomness"
    // claim, caught by adversarial review.
    const input = new ParseRequest();
    input.setText('_:x <http://example.org/p> _:y .');
    const r1 = await parseTurtle(ctx, input);
    const r2 = await parseTurtle(ctx, input);
    const r3 = await parseTurtle(ctx, input);
    expect(r1.getQuadsList()[0].getSubject()!.getValue()).toBe('x');
    expect(r1.getQuadsList()[0].getObject()!.getValue()).toBe('y');
    expect(r2.getQuadsList()[0].getSubject()!.getValue()).toBe('x');
    expect(r3.getQuadsList()[0].getSubject()!.getValue()).toBe('x');
  });
});
