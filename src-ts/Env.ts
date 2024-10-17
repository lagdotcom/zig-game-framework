import Allocator from "./Allocator";
import {
  Bytes,
  EnginePtr,
  FileDescriptor,
  Pixels,
  Ptr,
  SDL_RendererID,
  SDL_WindowID,
  StringPtr,
} from "./flavours";
import PromiseTracker from "./PromiseTracker";
import resources from "./resources";
import SDL_FRect from "./SDL_FRect";
import SDL_Rect from "./SDL_Rect";
import SDL_Renderer from "./SDL_Renderer";
import SDL_Surface from "./SDL_Surface";
import SDL_Texture from "./SDL_Texture";
import SDL_Window from "./SDL_Window";

const stub =
  (name: string) =>
  (...args: unknown[]) => {
    console.warn(name, ...args);
  };

const utf8Decoder = new TextDecoder("utf-8");

export interface EngineExports {
  memory: WebAssembly.Memory;
  main(): void;
  tick(engine: EnginePtr): boolean;
}

export default class Env {
  allocator!: Allocator;
  mem!: WebAssembly.Memory;
  engine!: EnginePtr;
  tracker: PromiseTracker;
  renderers: Record<SDL_RendererID, SDL_Renderer>;
  surfaces: Record<Ptr, SDL_Surface>;
  textures: Record<Ptr, SDL_Texture>;
  windows: Record<SDL_WindowID, SDL_Window>;

  constructor() {
    this.renderers = {};
    this.surfaces = {};
    this.textures = {};
    this.windows = {};

    this.tracker = new PromiseTracker();
  }

  start(x: EngineExports) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).env = this;
    this.mem = x.memory;
    this.allocator = new Allocator(x.memory);

    x.main();
    if (!this.engine) throw new Error("setEngineAddress not called");

    console.log(this);
    const tick = () => {
      if (this.tracker.ready) {
        const running = x.tick(this.engine);
        if (!running) return;
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  setEngineAddress = (addr: EnginePtr) => {
    this.engine = addr;
  };

  str(offset: StringPtr, count: Bytes) {
    return utf8Decoder.decode(this.mem.buffer.slice(offset, offset + count));
  }

  strZ(offset: StringPtr) {
    const view = new DataView(this.mem.buffer, offset);

    let count = 0;
    while (view.getUint8(count) != 0) count++;

    return this.str(offset, count);
  }

  rect(offset: Ptr) {
    return SDL_Rect.fromPointer(this.mem.buffer, offset);
  }

  floatRect(offset: Ptr) {
    return SDL_FRect.fromPointer(this.mem.buffer, offset);
  }

  loadResourceAsImage(data: string) {
    const url = resources[data];
    if (!url) throw new Error(`Missing resource: ${url}`);

    const surface = new SDL_Surface(this.allocator);
    surface.loadImage(this.tracker, url);
    this.surfaces[surface.id] = surface;
    return surface.id;
  }

  __errno_location = stub("__errno_location");
  SDL_DestroyWindow = stub("SDL_DestroyWindow");
  SDL_GetError = stub("SDL_GetError");
  SDL_Quit = stub("SDL_Quit");
  IMG_Quit = stub("IMG_Quit");

  SDL_Init = (type: number) => {
    console.log("SDL_Init", type);
    return true;
  };

  SDL_CreateWindow = (
    title: StringPtr,
    width: Pixels,
    height: Pixels,
    flags: number,
  ) => {
    const surface = new SDL_Surface(this.allocator, width, height);
    this.surfaces[surface.id] = surface;

    const window = new SDL_Window(
      surface,
      this.strZ(title),
      width,
      height,
      flags,
    );
    this.windows[window.id] = window;
    return window.id;
  };

  SDL_GetWindowSurface = (id: SDL_WindowID) => this.windows[id].surface;

  SDL_LoadBMP = (file: StringPtr) => {
    const data = this.strZ(file);
    console.log("SDL_LoadBMP", data);
    return this.loadResourceAsImage(data);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SDL_PollEvent = (buffer: Ptr) => {
    // TODO
    return false;
  };

  SDL_BlitSurface = (src: Ptr, srcRect: Ptr, dst: Ptr, dstRect: Ptr) => {
    const s = this.surfaces[src];
    if (!s.loaded) {
      console.warn(`SDL_BlitSurface: ${s.name} not loaded yet.`);
      return;
    }

    const d = this.surfaces[dst];

    const sr = srcRect ? this.rect(srcRect) : s.rect;
    const dr = dstRect ? this.rect(dstRect) : sr;

    d.ctx.drawImage(s.canvas, sr.x, sr.y, sr.w, sr.h, dr.x, dr.y, dr.w, dr.h);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SDL_UpdateWindowSurface = (wID: SDL_WindowID) => {
    // TODO
    return true;
  };

  SDL_CreateRenderer = (wID: SDL_WindowID) => {
    const renderer = new SDL_Renderer(this.windows[wID]);
    this.renderers[renderer.id] = renderer;
    return renderer.id;
  };

  SDL_DestroyRenderer = (rID: SDL_RendererID) => {
    delete this.renderers[rID];
  };

  IMG_Init = (flags: number) => flags;

  IMG_Load = (file: StringPtr) => {
    const data = this.strZ(file);
    console.log("IMG_Load", data);
    return this.loadResourceAsImage(data);
  };

  SDL_CreateTextureFromSurface = (rID: SDL_RendererID, sID: Ptr) => {
    const renderer = this.renderers[rID];
    const surface = this.surfaces[sID];

    const texture = new SDL_Texture(
      this.allocator,
      renderer,
      surface,
      this.tracker,
    );
    this.textures[texture.id] = texture;
    return texture.id;
  };

  SDL_SetRenderDrawColor = (
    rID: SDL_RendererID,
    r: number,
    g: number,
    b: number,
    a: number,
  ) => {
    const renderer = this.renderers[rID];
    renderer.color = `rgba(${r},${g},${b},${a})`;
    return true;
  };

  SDL_RenderClear = (rID: SDL_RendererID) => this.renderers[rID].clear();

  SDL_RenderTexture = (
    rID: SDL_RendererID,
    tID: Ptr,
    srcRect: Ptr,
    dstRect: Ptr,
  ) => {
    const r = this.renderers[rID];
    const t = this.textures[tID];

    const sr = srcRect ? this.floatRect(srcRect) : t.rect;
    const dr = dstRect ? this.floatRect(dstRect) : sr;

    return r.render(t, sr, dr);
  };

  SDL_RenderPresent = (rID: SDL_RendererID) => this.renderers[rID].present();

  SDL_DestroySurface = (sID: Ptr) => {
    delete this.surfaces[sID];
  };

  write = (fd: FileDescriptor, buf: StringPtr, count: Bytes) => {
    const data = this.str(buf, count);

    if (fd === 0) console.log(data);
    else if (fd === 2) console.error(data);
    else console.warn(data);

    return count;
  };
}
