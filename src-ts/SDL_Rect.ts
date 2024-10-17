import { Pixels, Ptr } from "./flavours";

export default class SDL_Rect {
  constructor(
    public x: Pixels,
    public y: Pixels,
    public w: Pixels,
    public h: Pixels,
  ) {}

  static fromPointer(buffer: ArrayBuffer, offset: Ptr) {
    const view = new DataView(buffer, offset);
    const x = view.getInt32(0, true);
    const y = view.getInt32(4, true);
    const w = view.getInt32(8, true);
    const h = view.getInt32(12, true);

    return new SDL_Rect(x, y, w, h);
  }
}
