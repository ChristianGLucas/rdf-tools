# rdf-tools

Composable [Axiom](https://axiomide.com) nodes for deterministic parsing, serialization,
format-conversion, and structural inspection of RDF / linked-data graphs. Built for the
Axiom marketplace under the `christiangeorgelucas` handle.

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/rdf-tools@0.1.0

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/rdf-tools/ParseTurtle --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/rdf-tools/0.1.0/ParseTurtle \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/rdf-tools/ParseTurtle`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

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
