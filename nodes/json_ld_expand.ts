import { JsonLdExpandRequest, JsonLdResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { jsonld, noNetworkDocumentLoader, parseJsonBounded, jsonLdErrorMessage } from './lib';

/**
 * JSON-LD "expand" a document: resolve every term against its context
 * into full IRIs, drop the "@context" itself, and normalize values into
 * their fully-expanded array form — the canonical, context-independent
 * representation the JSON-LD spec defines expansion to produce.
 * context_json is used ONLY when document_json has no "@context" of its
 * own (mirrors jsonld.js's expandContext option); a document whose own
 * "@context" is present is expanded using that, ignoring context_json.
 * OFFLINE BY CONSTRUCTION: this node's document loader unconditionally
 * refuses any URL — a "@context" that is (or contains) a URL string fails
 * with a structured error rather than being fetched; supply the context's
 * actual contents inline instead. Malformed JSON, or a document/context
 * JSON-LD itself rejects, returns a structured error. Input capped at
 * 10 MiB. Wraps jsonld.js (digitalbazaar/jsonld.js, BSD-3-Clause).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export async function jsonLdExpand(ax: AxiomContext, input: JsonLdExpandRequest): Promise<JsonLdResult> {
  const out = new JsonLdResult();
  try {
    const document = parseJsonBounded(input.getDocumentJson(), 'document_json');
    const contextJson = input.getContextJson();
    const options: Record<string, unknown> = { documentLoader: noNetworkDocumentLoader };
    if (contextJson) {
      options.expandContext = parseJsonBounded(contextJson, 'context_json');
    }
    const expanded = await jsonld.expand(document, options);
    out.setResultJson(JSON.stringify(expanded));
    return out;
  } catch (e) {
    out.setError(jsonLdErrorMessage(e, 'expanding JSON-LD'));
    return out;
  }
}
