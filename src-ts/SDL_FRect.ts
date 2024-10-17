import { Pixels, Ptr } from "./flavours";

export default class SDL_FRect {
  constructor(
    public x: Pixels,
    public y: Pixels,
    public w: Pixels,
    public h: Pixels,
  ) {}

  static fromPointer(buffer: ArrayBuffer, offset: Ptr) {
    const view = new DataView(buffer, offset);
    const x = view.getFloat32(0, true);
    const y = view.getFloat32(4, true);
    const w = view.getFloat32(8, true);
    const h = view.getFloat32(12, true);

    return new SDL_FRect(x, y, w, h);
  }
}
