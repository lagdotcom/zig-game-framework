enum SDL_Keymod {
  /** no modifier is applicable. */
  SDL_KMOD_NONE = 0x0000,

  /** the left Shift key is down. */
  SDL_KMOD_LSHIFT = 0x0001,

  /** the right Shift key is down. */
  SDL_KMOD_RSHIFT = 0x0002,

  /** the left Ctrl (Control) key is down. */
  SDL_KMOD_LCTRL = 0x0040,

  /** the right Ctrl (Control) key is down. */
  SDL_KMOD_RCTRL = 0x0080,

  /** the left Alt key is down. */
  SDL_KMOD_LALT = 0x0100,

  /** the right Alt key is down. */
  SDL_KMOD_RALT = 0x0200,

  /** the left GUI key (often the Windows key) is down. */
  SDL_KMOD_LGUI = 0x0400,

  /** the right GUI key (often the Windows key) is down. */
  SDL_KMOD_RGUI = 0x0800,

  /** the Num Lock key (may be located on an extended keypad) is down. */
  SDL_KMOD_NUM = 0x1000,

  /** the Caps Lock key is down. */
  SDL_KMOD_CAPS = 0x2000,

  /** the !AltGr key is down. */
  SDL_KMOD_MODE = 0x4000,

  /** the Scroll Lock key is down. */
  SDL_KMOD_SCROLL = 0x8000,
}
export default SDL_Keymod;
