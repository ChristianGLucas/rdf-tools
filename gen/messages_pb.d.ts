// package: christiangeorgelucas.rdf_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class Term extends jspb.Message {
  getTermType(): string;
  setTermType(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  getDatatype(): string;
  setDatatype(value: string): void;

  getLanguage(): string;
  setLanguage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Term.AsObject;
  static toObject(includeInstance: boolean, msg: Term): Term.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Term, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Term;
  static deserializeBinaryFromReader(message: Term, reader: jspb.BinaryReader): Term;
}

export namespace Term {
  export type AsObject = {
    termType: string,
    value: string,
    datatype: string,
    language: string,
  }
}

export class Quad extends jspb.Message {
  hasSubject(): boolean;
  clearSubject(): void;
  getSubject(): Term | undefined;
  setSubject(value?: Term): void;

  hasPredicate(): boolean;
  clearPredicate(): void;
  getPredicate(): Term | undefined;
  setPredicate(value?: Term): void;

  hasObject(): boolean;
  clearObject(): void;
  getObject(): Term | undefined;
  setObject(value?: Term): void;

  hasGraph(): boolean;
  clearGraph(): void;
  getGraph(): Term | undefined;
  setGraph(value?: Term): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Quad.AsObject;
  static toObject(includeInstance: boolean, msg: Quad): Quad.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Quad, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Quad;
  static deserializeBinaryFromReader(message: Quad, reader: jspb.BinaryReader): Quad;
}

export namespace Quad {
  export type AsObject = {
    subject?: Term.AsObject,
    predicate?: Term.AsObject,
    object?: Term.AsObject,
    graph?: Term.AsObject,
  }
}

export class QuadList extends jspb.Message {
  clearQuadsList(): void;
  getQuadsList(): Array<Quad>;
  setQuadsList(value: Array<Quad>): void;
  addQuads(value?: Quad, index?: number): Quad;

  getPrefixesMap(): jspb.Map<string, string>;
  clearPrefixesMap(): void;
  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QuadList.AsObject;
  static toObject(includeInstance: boolean, msg: QuadList): QuadList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QuadList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QuadList;
  static deserializeBinaryFromReader(message: QuadList, reader: jspb.BinaryReader): QuadList;
}

export namespace QuadList {
  export type AsObject = {
    quadsList: Array<Quad.AsObject>,
    prefixesMap: Array<[string, string]>,
    error: string,
  }
}

export class ParseRequest extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getBaseIri(): string;
  setBaseIri(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParseRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ParseRequest): ParseRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParseRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParseRequest;
  static deserializeBinaryFromReader(message: ParseRequest, reader: jspb.BinaryReader): ParseRequest;
}

export namespace ParseRequest {
  export type AsObject = {
    text: string,
    baseIri: string,
  }
}

export class SerializeRequest extends jspb.Message {
  clearQuadsList(): void;
  getQuadsList(): Array<Quad>;
  setQuadsList(value: Array<Quad>): void;
  addQuads(value?: Quad, index?: number): Quad;

  getPrefixesMap(): jspb.Map<string, string>;
  clearPrefixesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SerializeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SerializeRequest): SerializeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SerializeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SerializeRequest;
  static deserializeBinaryFromReader(message: SerializeRequest, reader: jspb.BinaryReader): SerializeRequest;
}

export namespace SerializeRequest {
  export type AsObject = {
    quadsList: Array<Quad.AsObject>,
    prefixesMap: Array<[string, string]>,
  }
}

export class SerializeResult extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SerializeResult.AsObject;
  static toObject(includeInstance: boolean, msg: SerializeResult): SerializeResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SerializeResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SerializeResult;
  static deserializeBinaryFromReader(message: SerializeResult, reader: jspb.BinaryReader): SerializeResult;
}

export namespace SerializeResult {
  export type AsObject = {
    text: string,
    error: string,
  }
}

export class ConvertRequest extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getFromFormat(): string;
  setFromFormat(value: string): void;

  getToFormat(): string;
  setToFormat(value: string): void;

  getBaseIri(): string;
  setBaseIri(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConvertRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ConvertRequest): ConvertRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConvertRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConvertRequest;
  static deserializeBinaryFromReader(message: ConvertRequest, reader: jspb.BinaryReader): ConvertRequest;
}

export namespace ConvertRequest {
  export type AsObject = {
    text: string,
    fromFormat: string,
    toFormat: string,
    baseIri: string,
  }
}

export class QuadListInput extends jspb.Message {
  clearQuadsList(): void;
  getQuadsList(): Array<Quad>;
  setQuadsList(value: Array<Quad>): void;
  addQuads(value?: Quad, index?: number): Quad;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QuadListInput.AsObject;
  static toObject(includeInstance: boolean, msg: QuadListInput): QuadListInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: QuadListInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QuadListInput;
  static deserializeBinaryFromReader(message: QuadListInput, reader: jspb.BinaryReader): QuadListInput;
}

export namespace QuadListInput {
  export type AsObject = {
    quadsList: Array<Quad.AsObject>,
  }
}

export class CountResult extends jspb.Message {
  getTotalQuads(): number;
  setTotalQuads(value: number): void;

  getTotalTriples(): number;
  setTotalTriples(value: number): void;

  getDistinctSubjects(): number;
  setDistinctSubjects(value: number): void;

  getDistinctPredicates(): number;
  setDistinctPredicates(value: number): void;

  getDistinctObjects(): number;
  setDistinctObjects(value: number): void;

  getDistinctGraphs(): number;
  setDistinctGraphs(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CountResult.AsObject;
  static toObject(includeInstance: boolean, msg: CountResult): CountResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CountResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CountResult;
  static deserializeBinaryFromReader(message: CountResult, reader: jspb.BinaryReader): CountResult;
}

export namespace CountResult {
  export type AsObject = {
    totalQuads: number,
    totalTriples: number,
    distinctSubjects: number,
    distinctPredicates: number,
    distinctObjects: number,
    distinctGraphs: number,
    error: string,
  }
}

export class TermFilter extends jspb.Message {
  getHasValue(): boolean;
  setHasValue(value: boolean): void;

  hasTerm(): boolean;
  clearTerm(): void;
  getTerm(): Term | undefined;
  setTerm(value?: Term): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TermFilter.AsObject;
  static toObject(includeInstance: boolean, msg: TermFilter): TermFilter.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TermFilter, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TermFilter;
  static deserializeBinaryFromReader(message: TermFilter, reader: jspb.BinaryReader): TermFilter;
}

export namespace TermFilter {
  export type AsObject = {
    hasValue: boolean,
    term?: Term.AsObject,
  }
}

export class FilterRequest extends jspb.Message {
  clearQuadsList(): void;
  getQuadsList(): Array<Quad>;
  setQuadsList(value: Array<Quad>): void;
  addQuads(value?: Quad, index?: number): Quad;

  hasSubject(): boolean;
  clearSubject(): void;
  getSubject(): TermFilter | undefined;
  setSubject(value?: TermFilter): void;

  hasPredicate(): boolean;
  clearPredicate(): void;
  getPredicate(): TermFilter | undefined;
  setPredicate(value?: TermFilter): void;

  hasObject(): boolean;
  clearObject(): void;
  getObject(): TermFilter | undefined;
  setObject(value?: TermFilter): void;

  hasGraph(): boolean;
  clearGraph(): void;
  getGraph(): TermFilter | undefined;
  setGraph(value?: TermFilter): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FilterRequest.AsObject;
  static toObject(includeInstance: boolean, msg: FilterRequest): FilterRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FilterRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FilterRequest;
  static deserializeBinaryFromReader(message: FilterRequest, reader: jspb.BinaryReader): FilterRequest;
}

export namespace FilterRequest {
  export type AsObject = {
    quadsList: Array<Quad.AsObject>,
    subject?: TermFilter.AsObject,
    predicate?: TermFilter.AsObject,
    object?: TermFilter.AsObject,
    graph?: TermFilter.AsObject,
  }
}

export class TermList extends jspb.Message {
  clearTermsList(): void;
  getTermsList(): Array<Term>;
  setTermsList(value: Array<Term>): void;
  addTerms(value?: Term, index?: number): Term;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TermList.AsObject;
  static toObject(includeInstance: boolean, msg: TermList): TermList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TermList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TermList;
  static deserializeBinaryFromReader(message: TermList, reader: jspb.BinaryReader): TermList;
}

export namespace TermList {
  export type AsObject = {
    termsList: Array<Term.AsObject>,
    error: string,
  }
}

export class GetPrefixesRequest extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getFormat(): string;
  setFormat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPrefixesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPrefixesRequest): GetPrefixesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetPrefixesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPrefixesRequest;
  static deserializeBinaryFromReader(message: GetPrefixesRequest, reader: jspb.BinaryReader): GetPrefixesRequest;
}

export namespace GetPrefixesRequest {
  export type AsObject = {
    text: string,
    format: string,
  }
}

export class PrefixResult extends jspb.Message {
  getPrefixesMap(): jspb.Map<string, string>;
  clearPrefixesMap(): void;
  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrefixResult.AsObject;
  static toObject(includeInstance: boolean, msg: PrefixResult): PrefixResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PrefixResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrefixResult;
  static deserializeBinaryFromReader(message: PrefixResult, reader: jspb.BinaryReader): PrefixResult;
}

export namespace PrefixResult {
  export type AsObject = {
    prefixesMap: Array<[string, string]>,
    error: string,
  }
}

export class ExpandCurieRequest extends jspb.Message {
  getCurie(): string;
  setCurie(value: string): void;

  getPrefixesMap(): jspb.Map<string, string>;
  clearPrefixesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExpandCurieRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ExpandCurieRequest): ExpandCurieRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExpandCurieRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExpandCurieRequest;
  static deserializeBinaryFromReader(message: ExpandCurieRequest, reader: jspb.BinaryReader): ExpandCurieRequest;
}

export namespace ExpandCurieRequest {
  export type AsObject = {
    curie: string,
    prefixesMap: Array<[string, string]>,
  }
}

export class ExpandCurieResult extends jspb.Message {
  getIri(): string;
  setIri(value: string): void;

  getExpanded(): boolean;
  setExpanded(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExpandCurieResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExpandCurieResult): ExpandCurieResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExpandCurieResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExpandCurieResult;
  static deserializeBinaryFromReader(message: ExpandCurieResult, reader: jspb.BinaryReader): ExpandCurieResult;
}

export namespace ExpandCurieResult {
  export type AsObject = {
    iri: string,
    expanded: boolean,
    error: string,
  }
}

export class CompactIriRequest extends jspb.Message {
  getIri(): string;
  setIri(value: string): void;

  getPrefixesMap(): jspb.Map<string, string>;
  clearPrefixesMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompactIriRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CompactIriRequest): CompactIriRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CompactIriRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompactIriRequest;
  static deserializeBinaryFromReader(message: CompactIriRequest, reader: jspb.BinaryReader): CompactIriRequest;
}

export namespace CompactIriRequest {
  export type AsObject = {
    iri: string,
    prefixesMap: Array<[string, string]>,
  }
}

export class CompactIriResult extends jspb.Message {
  getCurie(): string;
  setCurie(value: string): void;

  getCompacted(): boolean;
  setCompacted(value: boolean): void;

  getMatchedPrefix(): string;
  setMatchedPrefix(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompactIriResult.AsObject;
  static toObject(includeInstance: boolean, msg: CompactIriResult): CompactIriResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CompactIriResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompactIriResult;
  static deserializeBinaryFromReader(message: CompactIriResult, reader: jspb.BinaryReader): CompactIriResult;
}

export namespace CompactIriResult {
  export type AsObject = {
    curie: string,
    compacted: boolean,
    matchedPrefix: string,
    error: string,
  }
}

export class JsonLdExpandRequest extends jspb.Message {
  getDocumentJson(): string;
  setDocumentJson(value: string): void;

  getContextJson(): string;
  setContextJson(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonLdExpandRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JsonLdExpandRequest): JsonLdExpandRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JsonLdExpandRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonLdExpandRequest;
  static deserializeBinaryFromReader(message: JsonLdExpandRequest, reader: jspb.BinaryReader): JsonLdExpandRequest;
}

export namespace JsonLdExpandRequest {
  export type AsObject = {
    documentJson: string,
    contextJson: string,
  }
}

export class JsonLdResult extends jspb.Message {
  getResultJson(): string;
  setResultJson(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonLdResult.AsObject;
  static toObject(includeInstance: boolean, msg: JsonLdResult): JsonLdResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JsonLdResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonLdResult;
  static deserializeBinaryFromReader(message: JsonLdResult, reader: jspb.BinaryReader): JsonLdResult;
}

export namespace JsonLdResult {
  export type AsObject = {
    resultJson: string,
    error: string,
  }
}

export class JsonLdCompactRequest extends jspb.Message {
  getDocumentJson(): string;
  setDocumentJson(value: string): void;

  getContextJson(): string;
  setContextJson(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonLdCompactRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JsonLdCompactRequest): JsonLdCompactRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JsonLdCompactRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonLdCompactRequest;
  static deserializeBinaryFromReader(message: JsonLdCompactRequest, reader: jspb.BinaryReader): JsonLdCompactRequest;
}

export namespace JsonLdCompactRequest {
  export type AsObject = {
    documentJson: string,
    contextJson: string,
  }
}

export class JsonLdToRdfRequest extends jspb.Message {
  getDocumentJson(): string;
  setDocumentJson(value: string): void;

  getContextJson(): string;
  setContextJson(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonLdToRdfRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JsonLdToRdfRequest): JsonLdToRdfRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JsonLdToRdfRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonLdToRdfRequest;
  static deserializeBinaryFromReader(message: JsonLdToRdfRequest, reader: jspb.BinaryReader): JsonLdToRdfRequest;
}

export namespace JsonLdToRdfRequest {
  export type AsObject = {
    documentJson: string,
    contextJson: string,
  }
}

export class JsonLdFromRdfRequest extends jspb.Message {
  getNquadsText(): string;
  setNquadsText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonLdFromRdfRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JsonLdFromRdfRequest): JsonLdFromRdfRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JsonLdFromRdfRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonLdFromRdfRequest;
  static deserializeBinaryFromReader(message: JsonLdFromRdfRequest, reader: jspb.BinaryReader): JsonLdFromRdfRequest;
}

export namespace JsonLdFromRdfRequest {
  export type AsObject = {
    nquadsText: string,
  }
}

export class ValidateRequest extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getFormat(): string;
  setFormat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateRequest): ValidateRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateRequest;
  static deserializeBinaryFromReader(message: ValidateRequest, reader: jspb.BinaryReader): ValidateRequest;
}

export namespace ValidateRequest {
  export type AsObject = {
    text: string,
    format: string,
  }
}

export class ValidateResult extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): void;

  getErrorMessage(): string;
  setErrorMessage(value: string): void;

  getLine(): number;
  setLine(value: number): void;

  getColumn(): number;
  setColumn(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateResult.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateResult): ValidateResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidateResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateResult;
  static deserializeBinaryFromReader(message: ValidateResult, reader: jspb.BinaryReader): ValidateResult;
}

export namespace ValidateResult {
  export type AsObject = {
    valid: boolean,
    errorMessage: string,
    line: number,
    column: number,
    error: string,
  }
}

