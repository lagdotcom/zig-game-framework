import Allocator from "../Allocator";
import { Pixels, Ptr, UrlString } from "../flavours";
import PromiseTracker from "../PromiseTracker";
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

export default class SDL_Surface {
  name: string;
  id: Ptr;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  loaded: boolean;
  promise: Promise<HTMLCanvasElement>;

  constructor(
    private allocator: Allocator,
    width: Pixels = 0,
    height: Pixels = 0,
  ) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    this.canvas = canvas;
    this.ctx = ctx;
    this.loaded = true;
    this.promise = Promise.resolve(canvas);
    this.id = allocator.alloc(32);
    this.name = `Surface<${this.id}>`;

    this.flags = 0;
    this.format = 0;
    this.width = width;
    this.height = height;
    this.pitch = 4;
    this.pixels = 0;
    this.refcount = 0;
    this.reserved = 0;
  }

  get view() {
    return new DataView(this.allocator.mem.buffer, this.id, 32);
  }

  get flags() {
    return this.view.getUint32(0, true);
  }
  set flags(value: SDL_SurfaceFlags) {
    this.view.setUint32(0, value, true);
  }

  get format() {
    return this.view.getUint32(4, true);
  }
  set format(value: SDL_PixelFormat) {
    this.view.setUint32(4, value, true);
  }

  get width() {
    return this.view.getInt32(8, true);
  }
  set width(value: Pixels) {
    this.view.setInt32(8, value, true);
    this.canvas.width = value;
  }

  get height() {
    return this.view.getInt32(12, true);
  }
  set height(value: Pixels) {
    this.view.setInt32(12, value, true);
    this.canvas.height = value;
  }

  get pitch() {
    return this.view.getInt32(16, true);
  }
  set pitch(value: number) {
    this.view.setInt32(16, value, true);
  }

  get pixels() {
    return this.view.getUint32(20, true);
  }
  set pixels(value: number) {
    this.view.setUint32(20, value, true);
  }

  get refcount() {
    return this.view.getInt32(24, true);
  }
  set refcount(value: number) {
    this.view.setInt32(24, value, true);
  }

  get reserved() {
    return this.view.getUint32(28, true);
  }
  set reserved(value: number) {
    this.view.setUint32(28, value, true);
  }

  get rect() {
    return new SDL_Rect(0, 0, this.width, this.height);
  }

  loadImage(tracker: PromiseTracker, url: UrlString) {
    this.promise = tracker.add(
      new Promise((resolve) => {
        this.name = `Surface<${url}>`;
        const img = document.createElement("img");
        img.src = url;
        img.addEventListener("load", () => {
          this.width = img.naturalWidth;
          this.height = img.naturalHeight;
          this.ctx.drawImage(img, 0, 0);
          this.loaded = true;
          resolve(this.canvas);
        });
        return this.promise;
      }),
    );
  }
}
