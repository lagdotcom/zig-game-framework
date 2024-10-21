import { Ptr } from "../flavours";

// https://spin.atomicobject.com/typescript-flexible-nominal-typing/
interface Flavouring<FlavourT> {
  _type?: FlavourT;
}
type Flavour<T, FlavourT> = T & Flavouring<FlavourT>;

export type SDL_MouseID = Flavour<number, "SDL_MouseID">;
export type SDL_KeyboardID = Flavour<number, "SDL_KeyboardID">;
export type SDL_RendererID = Flavour<number, "SDL_RendererID">;
export type SDL_WindowID = Flavour<number, "SDL_WindowID">;

export type SDL_ColorPtr = Flavour<Ptr, "SDL_ColorPtr">;
export type SDL_EventPtr = Flavour<Ptr, "SDL_EventPtr">;
export type SDL_FRectPtr = Flavour<Ptr, "SDL_FRectPtr">;
export type SDL_KeyboardStatePtr = Flavour<Ptr, "SDL_KeyboardStatePtr">;
export type SDL_RectPtr = Flavour<Ptr, "SDL_RectPtr">;
export type SDL_SurfacePtr = Flavour<Ptr, "SDL_SurfacePtr">;
export type SDL_TexturePtr = Flavour<Ptr, "SDL_TexturePtr">;

export type TTF_FontID = Flavour<number, "TTF_FontID">;
