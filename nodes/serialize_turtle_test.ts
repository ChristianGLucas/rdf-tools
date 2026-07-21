import { SerializeRequest } from '../gen/messages_pb';
import { serializeTurtle } from './serialize_turtle';
import { parseTurtle } from './parse_turtle';
import { ParseRequest } from '../gen/messages_pb';
import { ctx, FIXTURE_QUADS, FIXTURE_PREFIXES, mkQuad, iri } from './testkit';

describe('SerializeTurtle', () => {
  it('abbreviates IRIs using the given prefixes and emits an @prefix declaration', async () => {
    const input = new SerializeRequest();
    input.setQuadsList(FIXTURE_QUADS);
    const map = input.getPrefixesMap();
    for (const [k, v] of Object.entries(FIXTURE_PREFIXES)) map.set(k, v);

    const result = await serializeTurtle(ctx, input);
    expect(result.getError()).toBe('');
    const text = result.getText();

    // Hand-derived expectations about Turtle syntax: a compacted @prefix
    // line for each namespace, and compacted "ex:alice" terms rather than
    // full <...> IRIs.
    expect(text).toContain('@prefix ex: <http://example.org/>');
    expect(text).toContain('@prefix foaf: <http://xmlns.com/foaf/0.1/>');
    expect(text).toContain('ex:alice');
    expect(text).toContain('foaf:knows');
    expect(text).not.toContain('<http://example.org/alice>'); // should be compacted, not a full IRI

    // Round-trip through this package's own parser recovers the same
    // triples (supplementary self-consistency check, not the primary
    // oracle above).
    const reparsed = new ParseRequest();
    reparsed.setText(text);
    const reparsedResult = await parseTurtle(ctx, reparsed);
    expect(reparsedResult.getError()).toBe('');
    expect(reparsedResult.getQuadsList()).toHaveLength(FIXTURE_QUADS.length);
  });

  it('is deterministic: the same input serializes to byte-identical output', async () => {
    const input = new SerializeRequest();
    input.setQuadsList(FIXTURE_QUADS);
    const r1 = await serializeTurtle(ctx, input);
    const r2 = await serializeTurtle(ctx, input);
    expect(r1.getText()).toBe(r2.getText());
  });

  it('writes a full IRI for a term matched by no prefix', async () => {
    const input = new SerializeRequest();
    input.setQuadsList([mkQuad(iri('http://other.org/s'), iri('http://other.org/p'), iri('http://other.org/o'))]);
    const result = await serializeTurtle(ctx, input);
    expect(result.getText()).toContain('<http://other.org/s>');
  });

  it('returns a structured error for an unrecognized term_type', async () => {
    const badTerm = iri('x');
    badTerm.setTermType('NotARealType');
    const input = new SerializeRequest();
    input.setQuadsList([mkQuad(badTerm, iri('http://example.org/p'), iri('http://example.org/o'))]);
    const result = await serializeTurtle(ctx, input);
    expect(result.getError()).not.toBe('');
  });
});
