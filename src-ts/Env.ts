import Allocator from "./Allocator";
import {
  Bytes,
  FileDescriptor,
  FontName,
  Int32Ptr,
  Pixels,
  RGBAComponent,
  RGBAValue,
  StringPtr,
} from "./flavours";
import KeyboardListener from "./KeyboardListener";
import makeStructViewer, { cast, u8 } from "./makeStructViewer";
import { ResourceMap } from "./Manifest";
import {
  SDL_ColorPtr,
  SDL_EventPtr,
  SDL_FRectPtr,
  SDL_RectPtr,
  SDL_RendererID,
  SDL_SurfacePtr,
  SDL_TexturePtr,
  SDL_WindowID,
  TTF_FontID,
} from "./sdl/flavours";
import IMG_InitFlags from "./sdl/IMG_InitFlags";
import {
  SDL_PROP_APP_METADATA_IDENTIFIER_STRING,
  SDL_PROP_APP_METADATA_NAME_STRING,
  SDL_PROP_APP_METADATA_VERSION_STRING,
} from "./sdl/metadataKeys";
import SDL_Event from "./sdl/SDL_Event";
import SDL_FRect from "./sdl/SDL_FRect";
import SDL_InitFlags from "./sdl/SDL_InitFlags";
import SDL_Rect from "./sdl/SDL_Rect";
import SDL_Renderer from "./sdl/SDL_Renderer";
import SDL_Surface from "./sdl/SDL_Surface";
import SDL_Texture from "./sdl/SDL_Texture";
import SDL_Window from "./sdl/SDL_Window";
import SDL_WindowFlags from "./sdl/SDL_WindowFlags";
import TTF_Font from "./sdl/TTF_Font";
import decomposeFlags from "./utils/decomposeFlags";
import { createRGBA, toRGBAString } from "./utils/rgba";
import WordWrapper from "./WordWrapper";

const getRGBAView = makeStructViewer({
  r: cast<RGBAComponent>(u8),
  g: cast<RGBAComponent>(u8),
  b: cast<RGBAComponent>(u8),
  a: cast<RGBAComponent>(u8),
});

const stub =
  (name: string) =>
  (...args: unknown[]) => {
    console.warn(name, ...args);
  };

const destroyer =
  <K, V extends { destroy(): void }>(mapping: Map<K, V>) =>
  (id: K) => {
    const item = mapping.get(id);
    if (!item) return false;

    item.destroy();
    mapping.delete(id);
    return true;
  };

const utf8Decoder = new TextDecoder("utf-8");
const utf8Encoder = new TextEncoder();

const supportedImageFlags =
  IMG_InitFlags.IMG_INIT_JPG | IMG_InitFlags.IMG_INIT_PNG;

export interface EngineExports {
  memory: WebAssembly.Memory;
  main(): void;
  tick(): boolean;
}

export default class Env {
  allocator!: Allocator;
  error!: StringPtr;
  mem!: WebAssembly.Memory;
  keys!: KeyboardListener;
  wrapper: WordWrapper;

  events: SDL_Event[];
  imageInit: IMG_InitFlags;

  fonts: Map<TTF_FontID, TTF_Font>;
  metadata: Map<string, string>;
  renderers: Map<SDL_RendererID, SDL_Renderer>;
  surfaces: Map<SDL_SurfacePtr, SDL_Surface>;
  textures: Map<SDL_TexturePtr, SDL_Texture>;
  windows: Map<SDL_WindowID, SDL_Window>;

  SDL_DestroyRenderer: (rID: SDL_RendererID) => boolean;
  SDL_DestroySurface: (pSurface: SDL_SurfacePtr) => boolean;
  SDL_DestroyTexture: (pSurface: SDL_TexturePtr) => boolean;
  SDL_DestroyWindow: (wID: SDL_WindowID) => boolean;
  TTF_CloseFont: (fID: TTF_FontID) => boolean;

  constructor(
    public resources: ResourceMap,
    public fontTranslation: Partial<Record<string, FontName>>,
  ) {
    this.wrapper = new WordWrapper();
    this.imageInit = 0;
    this.events = [];

    this.fonts = new Map();
    this.metadata = new Map();
    this.renderers = new Map();
    this.surfaces = new Map();
    this.textures = new Map();
    this.windows = new Map();

    this.SDL_DestroyRenderer = destroyer(this.renderers);
    this.SDL_DestroySurface = destroyer(this.surfaces);
    this.SDL_DestroyTexture = destroyer(this.textures);
    this.SDL_DestroyWindow = destroyer(this.windows);
    this.TTF_CloseFont = destroyer(this.fonts);
  }

  start(x: EngineExports) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).env = this;
    this.mem = x.memory;
    this.allocator = new Allocator(x.memory);
    this.error = this.allocator.alloc(128, "errorBuffer");
    this.keys = new KeyboardListener(
      this.allocator,
      document.body,
      this.events,
    );

    x.main();

    console.log(this);
    const tick = () => {
      const running = x.tick();
      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  str(offset: StringPtr, count: Bytes) {
    return utf8Decoder.decode(this.mem.buffer.slice(offset, offset + count));
  }

  strZ(offset: StringPtr) {
    const view = new DataView(this.mem.buffer, offset);

    let count = 0;
    while (view.getUint8(count) != 0) count++;

    return this.str(offset, count);
  }

  writeStr(offset: StringPtr, data: string) {
    const view = new Uint8Array(this.mem.buffer.slice(offset));
    utf8Encoder.encodeInto(data, view);
  }

  rect(offset: SDL_RectPtr) {
    return SDL_Rect.fromPointer(this.mem.buffer, offset);
  }

  floatRect(offset: SDL_FRectPtr) {
    return SDL_FRect.fromPointer(this.mem.buffer, offset);
  }

  colour(offset: SDL_ColorPtr) {
    const { r, g, b, a } = getRGBAView(this.mem.buffer, offset);
    return { r, g, b, a };
  }

  loadResourceAsImage(data: string) {
    const img = this.resources[data];
    if (img.type !== "image")
      throw new Error(`Missing image resource: ${data}`);

    const surface = SDL_Surface.fromImage(this.allocator, img);
    this.surfaces.set(surface.ptr, surface);
    return surface.ptr;
  }

  setError(s: string) {
    this.writeStr(this.error, s);
    return false;
  }
  SDL_GetError = () => this.error;

  __errno_location = stub("__errno_location");
  SDL_Quit = stub("SDL_Quit");
  TTF_Quit = stub("TTF_Quit");

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
    const surface = new SDL_Surface(this.allocator, "Window", width, height);
    this.surfaces.set(surface.ptr, surface);

    const window = new SDL_Window(
      surface,
      this.strZ(title),
      width,
      height,
      flags,
      this.events,
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

  SDL_PollEvent = (buffer: SDL_EventPtr) => {
    const event = this.events.shift();
    if (event) {
      event.write(this.mem, buffer);
      return true;
    }

    return false;
  };

  SDL_BlitSurface = (
    src: SDL_SurfacePtr,
    srcRect: SDL_RectPtr,
    dst: SDL_SurfacePtr,
    dstRect: SDL_RectPtr,
  ) => {
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

  SDL_CreateTextureFromSurface = (
    rID: SDL_RendererID,
    pSurface: SDL_SurfacePtr,
  ) => {
    const renderer = this.renderers.get(rID);
    const surface = this.surfaces.get(pSurface);
    if (!renderer || !surface) return 0;

    const texture = new SDL_Texture(this.allocator, renderer, surface);
    this.textures.set(texture.ptr, texture);
    return texture.ptr;
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

    renderer.drawColor = `rgba(${r},${g},${b},${a})`;
    return true;
  };

  SDL_RenderClear = (rID: SDL_RendererID) =>
    this.renderers.get(rID)?.clear() ?? false;

  SDL_RenderTexture = (
    rID: SDL_RendererID,
    pTexture: SDL_TexturePtr,
    pSource: SDL_FRectPtr,
    pDestination: SDL_FRectPtr,
  ) => {
    const r = this.renderers.get(rID);
    const t = this.textures.get(pTexture);
    if (!r || !t) return false;

    const src = pSource ? this.floatRect(pSource) : t.rect;
    const dst = pDestination ? this.floatRect(pDestination) : r.rect;

    return r.render(t, src, dst);
  };

  SDL_RenderPresent = (rID: SDL_RendererID) =>
    this.renderers.get(rID)?.present() ?? false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SDL_GetKeyboardState = (ptr: Int32Ptr) => this.keys.ptr;

  // TODO this should use the surface's pixel format
  SDL_MapSurfaceRGB = (
    pSurface: SDL_SurfacePtr,
    r: RGBAComponent,
    g: RGBAComponent,
    b: RGBAComponent,
  ) => createRGBA(r, g, b);

  SDL_SetSurfaceColorKey = (
    pSurface: SDL_SurfacePtr,
    enabled: boolean,
    key: RGBAValue,
  ) => {
    const surface = this.surfaces.get(pSurface);
    if (!surface) return false;

    surface.colorKey = enabled ? key : undefined;
    return true;
  };

  SDL_SetAppMetadata = (
    pName: StringPtr,
    pVersion: StringPtr,
    pIdentifier: StringPtr,
  ) => {
    const name = this.strZ(pName);
    const version = this.strZ(pVersion);
    const identifier = this.strZ(pIdentifier);

    this.metadata.set(SDL_PROP_APP_METADATA_NAME_STRING, name);
    this.metadata.set(SDL_PROP_APP_METADATA_VERSION_STRING, version);
    this.metadata.set(SDL_PROP_APP_METADATA_IDENTIFIER_STRING, identifier);
    return true;
  };

  SDL_SetAppMetadataProperty = (pName: StringPtr, pValue: StringPtr) => {
    const name = this.strZ(pName);
    const value = this.strZ(pValue);

    this.metadata.set(name, value);
    return true;
  };

  TTF_Init = () => {
    console.log("TTF_Init");
    return true;
  };

  TTF_OpenFont = (pName: StringPtr, size: Pixels) => {
    const face = this.strZ(pName);
    const font = new TTF_Font(this.fontTranslation[face] ?? face, size);

    this.fonts.set(font.id, font);
    return font.id;
  };

  TTF_RenderText_Blended = (
    fID: TTF_FontID,
    pText: StringPtr,
    length: Bytes,
    pColour: SDL_ColorPtr,
  ) => this.TTF_RenderText_Blended_Wrapped(fID, pText, length, pColour, 0);

  TTF_RenderText_Blended_Wrapped = (
    fID: TTF_FontID,
    pText: StringPtr,
    length: Bytes,
    pColour: SDL_ColorPtr,
    wrapWidth: number,
  ) => {
    const font = this.fonts.get(fID);
    if (!font) return 0;

    const text = length ? this.str(pText, length) : this.strZ(pText);

    const { lines, size } = this.wrapper.measure(font, text, wrapWidth);
    const surface = new SDL_Surface(
      this.allocator,
      `Text<${text}>`,
      size.width,
      size.height,
    );

    const fg = this.colour(pColour);
    surface.ctx.fillStyle = toRGBAString(fg.r, fg.g, fg.b, fg.a);
    surface.ctx.font = font.font;
    surface.ctx.textBaseline = "top";
    surface.ctx.textAlign = "left";

    const rowHeight = size.height / lines.length;
    let y = 0;
    for (const line of lines) {
      surface.ctx.fillText(line, 0, y);
      y += rowHeight;
    }

    surface.loaded = true;
    this.surfaces.set(surface.ptr, surface);
    return surface.ptr;
  };

  SDL_RenderFillRect = (rID: SDL_RendererID, pFRect: SDL_FRectPtr) => {
    const renderer = this.renderers.get(rID);
    if (!renderer) return false;

    const rect = this.floatRect(pFRect);
    return renderer.fill(rect);
  };

  SDL_SetRenderClipRect = (rID: SDL_RendererID, pRect: SDL_RectPtr) => {
    const renderer = this.renderers.get(rID);
    if (!renderer) return false;

    renderer.clip = pRect ? this.rect(pRect) : undefined;
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
