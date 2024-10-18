// https://spin.atomicobject.com/typescript-flexible-nominal-typing/
interface Flavouring<FlavourT> {
  _type?: FlavourT;
}
type Flavour<T, FlavourT> = T & Flavouring<FlavourT>;

export type Bytes = Flavour<number, "Bytes">;
export type EnginePtr = Flavour<number, "EnginePtr">;
export type FileDescriptor = Flavour<number, "FileDescriptor">;
export type Pixels = Flavour<number, "Pixels">;
export type Ptr = Flavour<number, "Ptr">;
export type StringPtr = Flavour<number, "StringPtr">;

export type Nanoseconds = Flavour<bigint, "Nanoseconds">;

export type UrlString = Flavour<string, "UrlString">;
