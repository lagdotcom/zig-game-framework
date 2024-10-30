import Allocator from "../Allocator";
import { Pixels } from "../flavours";
import makeStructViewer, { cast, int, u32 } from "../makeStructViewer";
import convertSurfaceToCanvas from "../utils/convertSurfaceToCanvas";
import { SDL_TexturePtr } from "./flavours";
import SDL_PixelFormat from "./SDL_PixelFormat";
import SDL_Rect from "./SDL_Rect";
import SDL_Renderer from "./SDL_Renderer";
import SDL_Surface from "./SDL_Surface";

/* struct SDL_Texture {
    SDL_PixelFormat format;     // The format of the texture, read-only
    int w;                      // The width of the texture, read-only.
    int h;                      // The height of the texture, read-only.

    int refcount;               // Application reference count, used when freeing texture
}; */

const getView = makeStructViewer({
  format: cast<SDL_PixelFormat>(u32),
  w: cast<Pixels>(int),
  h: cast<Pixels>(int),
  refcount: int,
});

export default class SDL_Texture {
  ptr: SDL_TexturePtr;
  canvas: OffscreenCanvas;
  name: string;

  constructor(
    private allocator: Allocator,
    public renderer: SDL_Renderer,
    surface: SDL_Surface,
    name = surface.name,
  ) {
    this.name = `Texture<${name}>`;
    this.ptr = allocator.alloc(16, this.name);

    const v = this.view;
    v.format = 0;
    v.w = surface.view.w;
    v.h = surface.view.h;
    v.refcount = 1;

    this.canvas = convertSurfaceToCanvas(surface);
  }

  destroy() {
    if (--this.view.refcount < 1) this.allocator.free(this.ptr);
  }

  get view() {
    return getView(this.allocator.mem.buffer, this.ptr);
  }

  get rect() {
    return new SDL_Rect(0, 0, this.view.w, this.view.h);
  }
}
