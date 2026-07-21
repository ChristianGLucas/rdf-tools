import { JsonLdCompactRequest, JsonLdResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { jsonld, noNetworkDocumentLoader, parseJsonBounded, jsonLdErrorMessage, BoundsError } from './lib';

/**
 * JSON-LD "compact" a document against a required context: rewrite full
 * IRIs back into the short terms/prefixes the context defines and
 * collapse single-element arrays, producing the compact, human-friendly
 * form the JSON-LD spec defines compaction to produce (the inverse
 * direction of JsonLdExpand). context_json is REQUIRED — unlike
 * JsonLdExpand's optional context, compaction has no meaningful
 * context-free result. OFFLINE BY CONSTRUCTION: this node's document
 * loader unconditionally refuses any URL — a context_json that is (or
 * contains) a URL string fails with a structured error rather than being
 * fetched; supply the context's actual contents inline instead.
 * Malformed JSON, an empty context_json, or a document/context JSON-LD
 * itself rejects, returns a structured error. Input capped at 10 MiB.
 * Wraps jsonld.js (digitalbazaar/jsonld.js, BSD-3-Clause).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function jsonLdCompact(ax: AxiomContext, input: JsonLdCompactRequest): Promise<JsonLdResult> {
  const out = new JsonLdResult();
  try {
    const contextJson = input.getContextJson();
    if (!contextJson) {
      throw new BoundsError('context_json is required');
    }
    const document = parseJsonBounded(input.getDocumentJson(), 'document_json');
    const context = parseJsonBounded(contextJson, 'context_json');
    const compacted = await jsonld.compact(document, context, { documentLoader: noNetworkDocumentLoader });
    out.setResultJson(JSON.stringify(compacted));
    return out;
  } catch (e) {
    out.setError(jsonLdErrorMessage(e, 'compacting JSON-LD'));
    return out;
  }
}
