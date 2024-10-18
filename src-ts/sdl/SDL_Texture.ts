import Allocator from "../Allocator";
import { Pixels, Ptr } from "../flavours";
import PromiseTracker from "../PromiseTracker";
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

export default class SDL_Texture {
  id: Ptr;
  bitmap!: ImageBitmap;

  constructor(
    private allocator: Allocator,
    public renderer: SDL_Renderer,
    surface: SDL_Surface,
    tracker: PromiseTracker,
  ) {
    this.id = allocator.alloc(16);
    this.format = 0;
    this.width = surface.width;
    this.height = surface.height;
    this.refcount = 0;

    tracker.add(
      surface.promise.then((canvas) =>
        window.createImageBitmap(canvas).then(this.loadFromBitmap),
      ),
    );
  }

  loadFromBitmap = (bitmap: ImageBitmap) => {
    this.bitmap = bitmap;
    this.format = 0;
    this.width = bitmap.width;
    this.height = bitmap.height;
    this.refcount = 0;
  };

  get view() {
    return new DataView(this.allocator.mem.buffer, this.id, 16);
  }

  get format() {
    return this.view.getUint32(0, true);
  }
  set format(value: SDL_PixelFormat) {
    this.view.setUint32(0, value, true);
  }

  get width() {
    return this.view.getInt32(4, true);
  }
  set width(value: Pixels) {
    this.view.setInt32(4, value, true);
  }

  get height() {
    return this.view.getInt32(8, true);
  }
  set height(value: Pixels) {
    this.view.setInt32(8, value, true);
  }

  get refcount() {
    return this.view.getInt32(12, true);
  }
  set refcount(value: number) {
    this.view.setInt32(12, value, true);
  }

  get rect() {
    return new SDL_Rect(0, 0, this.width, this.height);
  }
}
