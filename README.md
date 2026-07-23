# rdf-tools

Composable [Axiom](https://axiomide.com) nodes for deterministic parsing, serialization,
format-conversion, and structural inspection of RDF / linked-data graphs. Built for the
Axiom marketplace under the `christiangeorgelucas` handle.

## What it does

A single `Term` / `Quad` / `QuadList` envelope threads through every node: parse nodes
produce it, serialize/inspect nodes consume it, so any parse feeds any inspect/serialize
node without reshaping.

- **Parse** Turtle, N-Triples, N-Quads, and TriG into a normalized quad list plus any
  declared namespace prefixes.
- **Serialize** a quad list to Turtle, N-Triples, or N-Quads.
- **Convert** an RDF document from one syntax to another in a single call.
- **Inspect**: count quads/triples/distinct terms; filter quads by subject / predicate /
  object / graph; extract distinct subjects, predicates, objects, and prefixes.
- **CURIE arithmetic**: expand a prefixed name to a full IRI and compact a full IRI back,
  against a caller-supplied prefix map.
- **JSON-LD**: expand, compact, and convert to/from RDF (N-Quads).

21 nodes total. See `axiom.yaml` for the full list with descriptions.

## Design

- **Offline by construction.** Every JSON-LD node's document loader unconditionally
  refuses to dereference any URL — a remote `@context` is never fetched. Supply context
  contents inline (`context_json`), never a URL.
- **Deterministic.** Distinct-term extraction (`GetSubjects`/`GetPredicates`/`GetObjects`)
  is sorted independent of input order. No wall-clock, no randomness.
- **Bounded.** Input is capped by byte size (10 MiB) and quad count (1,000,000); malformed
  input returns a structured error, never a crash.
- **Pure text/structure in, text/structure out.** No filesystem, no database, no session
  state.

## What it wraps

- [`n3`](https://github.com/rdfjs/N3.js) (MIT) — Turtle / N-Triples / N-Quads / TriG
  parsing and serialization.
- [`jsonld`](https://github.com/digitalbazaar/jsonld.js) (BSD-3-Clause) — JSON-LD
  expand / compact / toRDF / fromRDF.

Both are permissively licensed; the full transitive dependency tree was verified clean
(MIT / BSD-3-Clause / ISC / Apache-2.0 only, no copyleft).

## License

MIT — Copyright (c) 2026 Christian George Lucas. See `LICENSE`.
