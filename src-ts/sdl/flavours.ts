// https://spin.atomicobject.com/typescript-flexible-nominal-typing/
interface Flavouring<FlavourT> {
  _type?: FlavourT;
}
type Flavour<T, FlavourT> = T & Flavouring<FlavourT>;

export type SDL_KeyboardID = Flavour<number, "SDL_KeyboardID">;
export type SDL_RendererID = Flavour<number, "SDL_RendererID">;
export type SDL_WindowID = Flavour<number, "SDL_WindowID">;

export type TTF_FontID = Flavour<number, "TTF_FontID">;
