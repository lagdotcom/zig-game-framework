import { RGBAComponent, RGBAValue } from "../flavours";

export function createRGBA(
  r: RGBAComponent,
  g: RGBAComponent,
  b: RGBAComponent,
  a: RGBAComponent = 0xff,
): RGBAValue {
  return r | (g << 8) | (b << 16) | (a << 24);
}

export function extractRGBA(v: RGBAValue) {
  const r: RGBAComponent = v & 0xff;
  const g: RGBAComponent = (v & 0xff00) >> 8;
  const b: RGBAComponent = (v & 0xff0000) >> 16;
  const a: RGBAComponent = (v & 0xff000000) >> 24;
  return { r, g, b, a };
}
