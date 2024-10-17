import Allocator from "./Allocator";
import {
  Bytes,
  EnginePtr,
  FileDescriptor,
  Pixels,
  Ptr,
  SDL_WindowID,
  StringPtr,
} from "./flavours";
import resources from "./resources";
import SDL_Rect from "./SDL_Rect";
import SDL_Surface from "./SDL_Surface";
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
  surfaces: Record<Ptr, SDL_Surface>;
  windows: Record<SDL_WindowID, SDL_Window>;

  constructor() {
    this.surfaces = {};
    this.windows = {};
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
      const running = x.tick(this.engine);
      if (running) requestAnimationFrame(tick);
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

  __errno_location = stub("__errno_location");
  SDL_DestroySurface = stub("SDL_DestroySurface");
  SDL_DestroyWindow = stub("SDL_DestroyWindow");
  SDL_GetError = stub("SDL_GetError");
  SDL_Quit = stub("SDL_Quit");

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

    const url = resources[data];
    if (!url) throw new Error(`Missing resource: ${url}`);

    const surface = new SDL_Surface(this.allocator);
    void surface.loadImage(url); // TODO do something with this
    this.surfaces[surface.id] = surface;
    return surface.id;
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
  SDL_UpdateWindowSurface = (window: SDL_WindowID) => {
    // TODO
    return true;
  };

  write = (fd: FileDescriptor, buf: StringPtr, count: Bytes) => {
    const data = this.str(buf, count);

    if (fd === 0) console.log(data);
    else if (fd === 2) console.error(data);
    else console.warn(data);

    return count;
  };
}
