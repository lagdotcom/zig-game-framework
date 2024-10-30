import { Bytes, Ptr } from "./flavours";

interface CField<T = unknown> {
  size: Bytes;
  getter: (view: DataView, offset: Bytes) => () => T;
  setter: (view: DataView, offset: Bytes) => (value: T) => void;
}

export const makeFieldSpec = <T>(
  size: Bytes,
  getter: (view: DataView, offset: Bytes) => () => T,
  setter: (view: DataView, offset: Bytes) => (value: T) => void,
): CField<T> => ({ size, getter, setter });

export const u8 = makeFieldSpec(
  1,
  (d, o) => () => d.getUint8(o),
  (d, o) => (v) => d.setUint8(o, v),
);

export const u16 = makeFieldSpec(
  2,
  (d, o) => () => d.getUint16(o, true),
  (d, o) => (v) => d.setUint16(o, v, true),
);

export const u32 = makeFieldSpec(
  4,
  (d, o) => () => d.getUint32(o, true),
  (d, o) => (v) => d.setUint32(o, v, true),
);

export const u64 = makeFieldSpec(
  8,
  (d, o) => () => d.getBigUint64(o, true),
  (d, o) => (v) => d.setBigUint64(o, v, true),
);

export const i8 = makeFieldSpec(
  1,
  (d, o) => () => d.getInt8(o),
  (d, o) => (v) => d.setInt8(o, v),
);

export const i16 = makeFieldSpec(
  2,
  (d, o) => () => d.getInt16(o, true),
  (d, o) => (v) => d.setInt16(o, v, true),
);

export const i32 = makeFieldSpec(
  4,
  (d, o) => () => d.getInt32(o, true),
  (d, o) => (v) => d.setInt32(o, v, true),
);
export const int = i32;

export const i64 = makeFieldSpec(
  8,
  (d, o) => () => d.getBigInt64(o, true),
  (d, o) => (v) => d.setBigInt64(o, v, true),
);

export const f32 = makeFieldSpec(
  4,
  (d, o) => () => d.getFloat32(o, true),
  (d, o) => (v) => d.setFloat32(o, v, true),
);

export const f64 = makeFieldSpec(
  8,
  (d, o) => () => d.getFloat64(o, true),
  (d, o) => (v) => d.setFloat64(o, v, true),
);

export const bool = makeFieldSpec(
  1,
  (d, o) => () => d.getUint8(o) != 0,
  (d, o) => (v) => d.setUint8(o, v ? 1 : 0),
);

export const cast = <T extends O, O = T>(spec: CField<O>) =>
  spec as unknown as CField<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CStruct = Record<string, CField<any>>;

type StructView<T extends CStruct> = {
  [F in keyof T]: T[F] extends CField<infer R> ? R : never;
};

function getStructView<T extends CStruct>(
  fields: T,
  buffer: ArrayBuffer,
  ptr: number,
): StructView<T> {
  const view = new DataView(buffer);
  const struct = {} as StructView<T>;
  let offset = ptr;

  for (const name in fields) {
    const { size, getter, setter } = fields[name];

    Object.defineProperty(struct, name, {
      get: getter(view, offset),
      set: setter(view, offset),
    });

    offset += size;
  }

  return struct;
}

const makeStructViewer =
  <T extends CStruct>(fields: T) =>
  (buffer: ArrayBuffer, offset: Ptr) =>
    getStructView(fields, buffer, offset);
export default makeStructViewer;
