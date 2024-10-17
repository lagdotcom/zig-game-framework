import Allocator from "./Allocator";
import { SDL_Event, SDL_KeyboardEvent } from "./events";
import { Ptr, SDL_Scancode } from "./flavours";
import SDL_EventType from "./SDL_EventType";
import SDL_Keycode from "./SDL_Keycode";
import SDL_Keymod from "./SDL_Keymod";

const scanCodes: Record<string, SDL_Scancode> = {
  a: 4,
  A: 4,
  b: 5,
  B: 5,
  c: 6,
  C: 6,
  d: 7,
  D: 7,
  e: 8,
  E: 8,
  f: 9,
  F: 9,
  g: 10,
  G: 10,
  h: 11,
  H: 11,
  i: 12,
  I: 12,
  j: 13,
  J: 13,
  k: 14,
  K: 14,
  l: 15,
  L: 15,
  m: 16,
  M: 16,
  n: 17,
  N: 17,
  o: 18,
  O: 18,
  p: 19,
  P: 19,
  q: 20,
  Q: 20,
  r: 21,
  R: 21,
  s: 22,
  S: 22,
  t: 23,
  T: 23,
  u: 24,
  U: 24,
  v: 25,
  V: 25,
  w: 26,
  W: 26,
  x: 27,
  X: 27,
  y: 28,
  Y: 28,
  z: 29,
  Z: 29,

  "1": 30,
  "2": 31,
  "3": 32,
  "4": 33,
  "5": 34,
  "6": 35,
  "7": 36,
  "8": 37,
  "9": 38,
  "0": 39,

  Enter: 40,
  Escape: 41,
  Backspace: 42,
  Tab: 43,
  " ": 44,

  "-": 45,
  "=": 46,
  "[": 47,
  "]": 48,
  "\\": 49,

  F1: 58,
  F2: 59,
  F3: 60,
  F4: 61,
  F5: 62,
  F6: 63,
  F7: 64,
  F8: 65,
  F9: 66,
  F10: 67,
  F11: 68,
  F12: 69,

  ArrowRight: 79,
  ArrowLeft: 80,
  ArrowDown: 81,
  ArrowUp: 82,
};

const keyCodes: Record<string, SDL_Keycode> = {
  a: SDL_Keycode.SDLK_A,
  A: SDL_Keycode.SDLK_A,
  b: SDL_Keycode.SDLK_B,
  B: SDL_Keycode.SDLK_B,
  c: SDL_Keycode.SDLK_C,
  C: SDL_Keycode.SDLK_C,
  d: SDL_Keycode.SDLK_D,
  D: SDL_Keycode.SDLK_D,
  e: SDL_Keycode.SDLK_E,
  E: SDL_Keycode.SDLK_E,
  f: SDL_Keycode.SDLK_F,
  F: SDL_Keycode.SDLK_F,
  g: SDL_Keycode.SDLK_G,
  G: SDL_Keycode.SDLK_G,
  h: SDL_Keycode.SDLK_H,
  H: SDL_Keycode.SDLK_H,
  i: SDL_Keycode.SDLK_I,
  I: SDL_Keycode.SDLK_I,
  j: SDL_Keycode.SDLK_J,
  J: SDL_Keycode.SDLK_J,
  k: SDL_Keycode.SDLK_K,
  K: SDL_Keycode.SDLK_K,
  l: SDL_Keycode.SDLK_L,
  L: SDL_Keycode.SDLK_L,
  m: SDL_Keycode.SDLK_M,
  M: SDL_Keycode.SDLK_M,
  n: SDL_Keycode.SDLK_N,
  N: SDL_Keycode.SDLK_N,
  o: SDL_Keycode.SDLK_O,
  O: SDL_Keycode.SDLK_O,
  p: SDL_Keycode.SDLK_P,
  P: SDL_Keycode.SDLK_P,
  q: SDL_Keycode.SDLK_Q,
  Q: SDL_Keycode.SDLK_Q,
  r: SDL_Keycode.SDLK_R,
  R: SDL_Keycode.SDLK_R,
  s: SDL_Keycode.SDLK_S,
  S: SDL_Keycode.SDLK_S,
  t: SDL_Keycode.SDLK_T,
  T: SDL_Keycode.SDLK_T,
  u: SDL_Keycode.SDLK_U,
  U: SDL_Keycode.SDLK_U,
  v: SDL_Keycode.SDLK_V,
  V: SDL_Keycode.SDLK_V,
  w: SDL_Keycode.SDLK_W,
  W: SDL_Keycode.SDLK_W,
  x: SDL_Keycode.SDLK_X,
  X: SDL_Keycode.SDLK_X,
  y: SDL_Keycode.SDLK_Y,
  Y: SDL_Keycode.SDLK_Y,
  z: SDL_Keycode.SDLK_Z,
  Z: SDL_Keycode.SDLK_Z,

  "1": SDL_Keycode.SDLK_1,
  "2": SDL_Keycode.SDLK_2,
  "3": SDL_Keycode.SDLK_3,
  "4": SDL_Keycode.SDLK_4,
  "5": SDL_Keycode.SDLK_5,
  "6": SDL_Keycode.SDLK_6,
  "7": SDL_Keycode.SDLK_7,
  "8": SDL_Keycode.SDLK_8,
  "9": SDL_Keycode.SDLK_9,
  "0": SDL_Keycode.SDLK_0,

  Enter: SDL_Keycode.SDLK_RETURN,
  Escape: SDL_Keycode.SDLK_ESCAPE,
  Backspace: SDL_Keycode.SDLK_BACKSPACE,
  Tab: SDL_Keycode.SDLK_TAB,
  " ": SDL_Keycode.SDLK_SPACE,

  "-": SDL_Keycode.SDLK_MINUS,
  "=": SDL_Keycode.SDLK_EQUALS,
  "[": SDL_Keycode.SDLK_LEFTBRACKET,
  "]": SDL_Keycode.SDLK_RIGHTBRACKET,
  "\\": SDL_Keycode.SDLK_BACKSLASH,

  F1: SDL_Keycode.SDLK_F1,
  F2: SDL_Keycode.SDLK_F2,
  F3: SDL_Keycode.SDLK_F3,
  F4: SDL_Keycode.SDLK_F4,
  F5: SDL_Keycode.SDLK_F5,
  F6: SDL_Keycode.SDLK_F6,
  F7: SDL_Keycode.SDLK_F7,
  F8: SDL_Keycode.SDLK_F8,
  F9: SDL_Keycode.SDLK_F9,
  F10: SDL_Keycode.SDLK_F10,
  F11: SDL_Keycode.SDLK_F11,
  F12: SDL_Keycode.SDLK_F12,

  ArrowRight: SDL_Keycode.SDLK_RIGHT,
  ArrowLeft: SDL_Keycode.SDLK_LEFT,
  ArrowDown: SDL_Keycode.SDLK_DOWN,
  ArrowUp: SDL_Keycode.SDLK_UP,
};

function mod(e: KeyboardEvent) {
  let m: SDL_Keymod = 0;

  if (e.shiftKey) m |= SDL_Keymod.SDL_KMOD_LSHIFT | SDL_Keymod.SDL_KMOD_RSHIFT;
  if (e.ctrlKey) m |= SDL_Keymod.SDL_KMOD_LCTRL | SDL_Keymod.SDL_KMOD_RCTRL;
  if (e.altKey) m |= SDL_Keymod.SDL_KMOD_LALT | SDL_Keymod.SDL_KMOD_RALT;
  if (e.metaKey) m |= SDL_Keymod.SDL_KMOD_LGUI | SDL_Keymod.SDL_KMOD_RGUI;

  return m;
}

export default class Keys {
  ptr: Ptr;

  constructor(
    private allocator: Allocator,
    element: HTMLElement,
    private events: SDL_Event[],
  ) {
    this.ptr = allocator.calloc(512);

    element.addEventListener("keydown", this.keyDown);
    element.addEventListener("keyup", this.keyUp);
  }

  get view() {
    return new DataView(this.allocator.mem.buffer, this.ptr);
  }

  keyDown = (e: KeyboardEvent) => {
    const scan = scanCodes[e.key];
    const key = keyCodes[e.key];
    if (scan && key) {
      this.view.setInt32(scan, 1, true);
      this.events.push(
        new SDL_KeyboardEvent(
          SDL_EventType.SDL_EVENT_KEY_DOWN,
          0,
          0,
          scan,
          key,
          mod(e),
          e.keyCode,
          true,
          e.repeat,
        ),
      );
    } else console.warn(`No known scan/key code for ${e.key}`);
  };

  keyUp = (e: KeyboardEvent) => {
    const scan = scanCodes[e.key];
    const key = keyCodes[e.key];
    if (scan && key) {
      this.view.setInt32(scan, 0, true);
      this.events.push(
        new SDL_KeyboardEvent(
          SDL_EventType.SDL_EVENT_KEY_DOWN,
          0,
          0,
          scan,
          key,
          mod(e),
          e.keyCode,
          false,
          e.repeat,
        ),
      );
    } else console.warn(`No known scan/key code for ${e.key}`);
  };
}
