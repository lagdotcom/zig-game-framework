// https://spin.atomicobject.com/typescript-flexible-nominal-typing/
interface Flavouring<FlavourT> {
  _type?: FlavourT;
}
type Flavour<T, FlavourT> = T & Flavouring<FlavourT>;

export type Bytes = Flavour<number, "Bytes">;
export type FileDescriptor = Flavour<number, "FileDescriptor">;
export type FontPointSize = Flavour<number, "FontPointSize">;
export type Pixels = Flavour<number, "Pixels">;
export type Ptr = Flavour<number, "Ptr">;
export type RGBAComponent = Flavour<number, "RGBAComponent">;
export type RGBAValue = Flavour<number, "RGBAValue">;

export type Int32Ptr = Flavour<Ptr, "Int32Ptr">;
export type StringPtr = Flavour<Ptr, "StringPtr">;

export type Nanoseconds = Flavour<bigint, "Nanoseconds">;

export type FontName = Flavour<string, "FontName">;
export type UrlString = Flavour<string, "UrlString">;
