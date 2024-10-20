import Allocator from "./Allocator";
import {
  Bytes,
  EnginePtr,
  FileDescriptor,
  Pixels,
  Ptr,
  RGBAComponent,
  RGBAValue,
  StringPtr,
} from "./flavours";
import KeyboardListener from "./KeyboardListener";
import { ResourceMap } from "./Manifest";
import { SDL_RendererID, SDL_WindowID } from "./sdl/flavours";
import IMG_InitFlags from "./sdl/IMG_InitFlags";
import SDL_Event from "./sdl/SDL_Event";
import SDL_FRect from "./sdl/SDL_FRect";
import SDL_InitFlags from "./sdl/SDL_InitFlags";
import SDL_Rect from "./sdl/SDL_Rect";
import SDL_Renderer from "./sdl/SDL_Renderer";
import SDL_Surface from "./sdl/SDL_Surface";
import SDL_Texture from "./sdl/SDL_Texture";
import SDL_Window from "./sdl/SDL_Window";
import SDL_WindowFlags from "./sdl/SDL_WindowFlags";
import decomposeFlags from "./utils/decomposeFlags";
import { createRGBA } from "./utils/rgba";

const stub =
  (name: string) =>
  (...args: unknown[]) => {
    console.warn(name, ...args);
  };

const utf8Decoder = new TextDecoder("utf-8");

const supportedImageFlags =
  IMG_InitFlags.IMG_INIT_JPG | IMG_InitFlags.IMG_INIT_PNG;

export interface EngineExports {
  memory: WebAssembly.Memory;
  main(): void;
  tick(engine: EnginePtr): boolean;
}

export default class Env {
  allocator!: Allocator;
  mem!: WebAssembly.Memory;
  engine!: EnginePtr;
  keys!: KeyboardListener;

  events: SDL_Event[];
  imageInit: IMG_InitFlags;
  renderers: Map<SDL_RendererID, SDL_Renderer>;
  surfaces: Map<Ptr, SDL_Surface>;
  textures: Map<Ptr, SDL_Texture>;
  windows: Map<SDL_WindowID, SDL_Window>;

  constructor(public resources: ResourceMap) {
    this.imageInit = 0;
    this.events = [];
    this.renderers = new Map();
    this.surfaces = new Map();
    this.textures = new Map();
    this.windows = new Map();
  }

  start(x: EngineExports) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).env = this;
    this.mem = x.memory;
    this.allocator = new Allocator(x.memory);
    this.keys = new KeyboardListener(
      this.allocator,
      document.body,
      this.events,
    );

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

  floatRect(offset: Ptr) {
    return SDL_FRect.fromPointer(this.mem.buffer, offset);
  }

  loadResourceAsImage(data: string) {
    const img = this.resources[data];
    if (img.type !== "image")
      throw new Error(`Missing image resource: ${data}`);

    const surface = SDL_Surface.fromImage(this.allocator, img);
    this.surfaces.set(surface.id, surface);
    return surface.id;
  }

  __errno_location = stub("__errno_location");
  SDL_DestroyWindow = stub("SDL_DestroyWindow");
  SDL_GetError = stub("SDL_GetError");
  SDL_Quit = stub("SDL_Quit");

  SDL_Init = (type: SDL_InitFlags) => {
    console.log("SDL_Init", decomposeFlags(type, SDL_InitFlags));
    return true;
  };

  SDL_CreateWindow = (
    title: StringPtr,
    width: Pixels,
    height: Pixels,
    flags: SDL_WindowFlags,
  ) => {
    const surface = new SDL_Surface(this.allocator, width, height);
    this.surfaces.set(surface.id, surface);

    const window = new SDL_Window(
      surface,
      this.strZ(title),
      width,
      height,
      flags,
    );
    this.windows.set(window.id, window);
    return window.id;
  };

  SDL_GetWindowSurface = (id: SDL_WindowID) =>
    this.windows.get(id)?.surface ?? 0;

  SDL_LoadBMP = (file: StringPtr) => {
    const data = this.strZ(file);
    console.log("SDL_LoadBMP", data);
    return this.loadResourceAsImage(data);
  };

  SDL_PollEvent = (buffer: Ptr) => {
    const event = this.events.shift();
    if (event) {
      event.write(this.mem, buffer);
      return true;
    }

    return false;
  };

  SDL_BlitSurface = (src: Ptr, srcRect: Ptr, dst: Ptr, dstRect: Ptr) => {
    const s = this.surfaces.get(src);
    const d = this.surfaces.get(dst);
    if (!s || !d) return false;

    if (!s.loaded) {
      console.warn(`SDL_BlitSurface: ${s.name} not loaded yet.`);
      return;
    }

    const sr = srcRect ? this.rect(srcRect) : s.rect;
    const dr = dstRect ? this.rect(dstRect) : sr;

    d.ctx.drawImage(s.canvas, sr.x, sr.y, sr.w, sr.h, dr.x, dr.y, dr.w, dr.h);
    return true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SDL_UpdateWindowSurface = (wID: SDL_WindowID) => {
    // TODO
    return true;
  };

  SDL_CreateRenderer = (wID: SDL_WindowID) => {
    const window = this.windows.get(wID);
    if (!window) return false;

    const renderer = new SDL_Renderer(window);
    this.renderers.set(renderer.id, renderer);
    return renderer.id;
  };

  SDL_DestroyRenderer = (rID: SDL_RendererID) => this.renderers.delete(rID);

  IMG_Init = (flags: IMG_InitFlags) => {
    console.log("IMG_Init", decomposeFlags(flags, IMG_InitFlags));

    this.imageInit |= flags & supportedImageFlags;
    return this.imageInit;
  };

  IMG_Load = (file: StringPtr) => {
    const data = this.strZ(file);
    console.log("IMG_Load", data);
    return this.loadResourceAsImage(data);
  };

  IMG_Quit = () => {
    this.imageInit = 0;
  };

  SDL_CreateTextureFromSurface = (rID: SDL_RendererID, sID: Ptr) => {
    const renderer = this.renderers.get(rID);
    const surface = this.surfaces.get(sID);
    if (!renderer || !surface) return 0;

    const texture = new SDL_Texture(this.allocator, renderer, surface);
    this.textures.set(texture.id, texture);
    return texture.id;
  };

  SDL_SetRenderDrawColor = (
    rID: SDL_RendererID,
    r: RGBAComponent,
    g: RGBAComponent,
    b: RGBAComponent,
    a: RGBAComponent,
  ) => {
    const renderer = this.renderers.get(rID);
    if (!renderer) return false;

    renderer.color = `rgba(${r},${g},${b},${a})`;
    return true;
  };

  SDL_RenderClear = (rID: SDL_RendererID) =>
    this.renderers.get(rID)?.clear() ?? false;

  SDL_RenderTexture = (
    rID: SDL_RendererID,
    tID: Ptr,
    srcRect: Ptr,
    dstRect: Ptr,
  ) => {
    const r = this.renderers.get(rID);
    const t = this.textures.get(tID);
    if (!r || !t) return false;

    const sr = srcRect ? this.floatRect(srcRect) : t.rect;
    const dr = dstRect ? this.floatRect(dstRect) : sr;

    return r.render(t, sr, dr);
  };

  SDL_RenderPresent = (rID: SDL_RendererID) =>
    this.renderers.get(rID)?.present() ?? false;

  SDL_DestroySurface = (sID: Ptr) => this.surfaces.delete(sID);

  SDL_DestroyTexture = (tID: Ptr) => this.textures.delete(tID);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SDL_GetKeyboardState = (ptr: Ptr) => this.keys.ptr;

  // TODO this should use the surface's pixel format
  SDL_MapSurfaceRGB = (
    sID: Ptr,
    r: RGBAComponent,
    g: RGBAComponent,
    b: RGBAComponent,
  ) => createRGBA(r, g, b);

  SDL_SetSurfaceColorKey = (sID: Ptr, enabled: boolean, key: RGBAValue) => {
    const surface = this.surfaces.get(sID);
    if (!surface) return false;

    surface.colorKey = enabled ? key : undefined;
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
