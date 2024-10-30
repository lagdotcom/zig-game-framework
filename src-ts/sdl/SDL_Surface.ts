import Allocator from "../Allocator";
import { Bytes, Pixels, Ptr, RGBAValue } from "../flavours";
import makeStructViewer, { cast, int, u32 } from "../makeStructViewer";
import { ImageResource } from "../Manifest";
import makeCanvas from "../utils/makeCanvas";
import { SDL_SurfacePtr } from "./flavours";
import SDL_PixelFormat from "./SDL_PixelFormat";
import SDL_Rect from "./SDL_Rect";
import SDL_SurfaceFlags from "./SDL_SurfaceFlags";

/* struct SDL_Surface {
    SDL_SurfaceFlags flags;     // The flags of the surface, read-only [u32]
    SDL_PixelFormat format;     // The format of the surface, read-only [uint]
    int w;                      // The width of the surface, read-only.
    int h;                      // The height of the surface, read-only.
    int pitch;                  // The distance in bytes between rows of pixels, read-only
    void *pixels;               // A pointer to the pixels of the surface, the pixels are writeable if non-NULL
    int refcount;               // Application reference count, used when freeing surface
    void *reserved;             // Reserved for internal use
}; */

const getView = makeStructViewer({
  flags: cast<SDL_SurfaceFlags>(u32),
  format: cast<SDL_PixelFormat>(int),
  w: cast<Pixels>(int),
  h: cast<Pixels>(int),
  pitch: cast<Bytes>(int),
  pixels: cast<Ptr>(u32),
  refcount: int,
  reserved: cast<Ptr>(u32),
});

export default class SDL_Surface {
  ptr: SDL_SurfacePtr;
  name: string;
  canvas: HTMLCanvasElement;
  colorKey?: RGBAValue;
  ctx: CanvasRenderingContext2D;
  loaded: boolean;

  constructor(
    private allocator: Allocator,
    name: string,
    width: Pixels = 0,
    height: Pixels = 0,
  ) {
    const { canvas, ctx } = makeCanvas(width, height);

    this.canvas = canvas;
    this.ctx = ctx;
    this.loaded = true;
    this.name = `Surface<${name}>`;
    this.ptr = allocator.alloc(32, this.name);

    const v = this.view;
    v.flags = 0;
    v.format = SDL_PixelFormat.SDL_PIXELFORMAT_RGBA8888;
    v.w = width;
    v.h = height;
    v.pitch = 4 * width;
    v.pixels = 0;
    v.refcount = 1;
    v.reserved = 0;
  }

  static fromImage(allocator: Allocator, res: ImageResource) {
    const surface = new SDL_Surface(
      allocator,
      res.path,
      res.img.naturalWidth,
      res.img.naturalHeight,
    );
    surface.name = `Surface<${res.path}>`;
    surface.ctx.drawImage(res.img, 0, 0);
    surface.loaded = true;

    return surface;
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
