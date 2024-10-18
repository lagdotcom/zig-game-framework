import Allocator from "./Allocator";
import { Ptr } from "./flavours";
import SDL_Event, { SDL_KeyboardEvent } from "./sdl/SDL_Event";
import SDL_EventType from "./sdl/SDL_EventType";
import KC from "./sdl/SDL_Keycode";
import KM from "./sdl/SDL_Keymod";
import SC from "./sdl/SDL_Scancode";

interface KeyData {
  scan: SC;
  key: KC;
  mod?: KM;
}

const codes: Record<number, KeyData> = {
  179: {
    scan: SC.SDL_SCANCODE_MEDIA_PLAY_PAUSE,
    key: KC.SDLK_MEDIA_PLAY_PAUSE,
  },
  174: { scan: SC.SDL_SCANCODE_VOLUMEDOWN, key: KC.SDLK_VOLUMEDOWN },
  175: { scan: SC.SDL_SCANCODE_VOLUMEUP, key: KC.SDLK_VOLUMEUP },
  173: { scan: SC.SDL_SCANCODE_MUTE, key: KC.SDLK_MUTE },

  27: { scan: SC.SDL_SCANCODE_ESCAPE, key: KC.SDLK_ESCAPE },

  112: { scan: SC.SDL_SCANCODE_F1, key: KC.SDLK_F1 },
  113: { scan: SC.SDL_SCANCODE_F2, key: KC.SDLK_F2 },
  114: { scan: SC.SDL_SCANCODE_F3, key: KC.SDLK_F3 },
  115: { scan: SC.SDL_SCANCODE_F4, key: KC.SDLK_F4 },
  116: { scan: SC.SDL_SCANCODE_F5, key: KC.SDLK_F5 },
  117: { scan: SC.SDL_SCANCODE_F6, key: KC.SDLK_F6 },
  118: { scan: SC.SDL_SCANCODE_F7, key: KC.SDLK_F7 },
  119: { scan: SC.SDL_SCANCODE_F8, key: KC.SDLK_F8 },
  120: { scan: SC.SDL_SCANCODE_F9, key: KC.SDLK_F9 },
  121: { scan: SC.SDL_SCANCODE_F10, key: KC.SDLK_F10 },
  122: { scan: SC.SDL_SCANCODE_F11, key: KC.SDLK_F11 },
  123: { scan: SC.SDL_SCANCODE_F12, key: KC.SDLK_F12 },

  145: { scan: SC.SDL_SCANCODE_SCROLLLOCK, key: KC.SDLK_SCROLLLOCK },
  19: { scan: SC.SDL_SCANCODE_PAUSE, key: KC.SDLK_PAUSE },

  223: { scan: SC.SDL_SCANCODE_GRAVE, key: KC.SDLK_GRAVE },
  49: { scan: SC.SDL_SCANCODE_1, key: KC.SDLK_1 },
  50: { scan: SC.SDL_SCANCODE_2, key: KC.SDLK_2 },
  51: { scan: SC.SDL_SCANCODE_3, key: KC.SDLK_3 },
  52: { scan: SC.SDL_SCANCODE_4, key: KC.SDLK_4 },
  53: { scan: SC.SDL_SCANCODE_5, key: KC.SDLK_5 },
  54: { scan: SC.SDL_SCANCODE_6, key: KC.SDLK_6 },
  55: { scan: SC.SDL_SCANCODE_7, key: KC.SDLK_7 },
  56: { scan: SC.SDL_SCANCODE_8, key: KC.SDLK_8 },
  57: { scan: SC.SDL_SCANCODE_9, key: KC.SDLK_9 },
  48: { scan: SC.SDL_SCANCODE_0, key: KC.SDLK_0 },
  189: { scan: SC.SDL_SCANCODE_MINUS, key: KC.SDLK_MINUS },
  187: { scan: SC.SDL_SCANCODE_EQUALS, key: KC.SDLK_EQUALS },
  8: { scan: SC.SDL_SCANCODE_BACKSPACE, key: KC.SDLK_BACKSPACE },

  9: { scan: SC.SDL_SCANCODE_TAB, key: KC.SDLK_TAB },
  81: { scan: SC.SDL_SCANCODE_Q, key: KC.SDLK_Q },
  87: { scan: SC.SDL_SCANCODE_W, key: KC.SDLK_W },
  69: { scan: SC.SDL_SCANCODE_E, key: KC.SDLK_E },
  82: { scan: SC.SDL_SCANCODE_R, key: KC.SDLK_R },
  84: { scan: SC.SDL_SCANCODE_T, key: KC.SDLK_T },
  89: { scan: SC.SDL_SCANCODE_Y, key: KC.SDLK_Y },
  85: { scan: SC.SDL_SCANCODE_U, key: KC.SDLK_U },
  73: { scan: SC.SDL_SCANCODE_I, key: KC.SDLK_I },
  79: { scan: SC.SDL_SCANCODE_O, key: KC.SDLK_O },
  80: { scan: SC.SDL_SCANCODE_P, key: KC.SDLK_P },
  219: { scan: SC.SDL_SCANCODE_LEFTBRACKET, key: KC.SDLK_LEFTBRACKET },
  221: { scan: SC.SDL_SCANCODE_RIGHTBRACKET, key: KC.SDLK_RIGHTBRACKET },
  // 13: Return,

  20: { scan: SC.SDL_SCANCODE_CAPSLOCK, key: KC.SDLK_CAPSLOCK },
  65: { scan: SC.SDL_SCANCODE_A, key: KC.SDLK_A },
  83: { scan: SC.SDL_SCANCODE_S, key: KC.SDLK_S },
  68: { scan: SC.SDL_SCANCODE_D, key: KC.SDLK_D },
  70: { scan: SC.SDL_SCANCODE_F, key: KC.SDLK_F },
  71: { scan: SC.SDL_SCANCODE_G, key: KC.SDLK_G },
  72: { scan: SC.SDL_SCANCODE_H, key: KC.SDLK_H },
  74: { scan: SC.SDL_SCANCODE_J, key: KC.SDLK_J },
  75: { scan: SC.SDL_SCANCODE_K, key: KC.SDLK_K },
  76: { scan: SC.SDL_SCANCODE_L, key: KC.SDLK_L },
  186: { scan: SC.SDL_SCANCODE_SEMICOLON, key: KC.SDLK_SEMICOLON },
  192: { scan: SC.SDL_SCANCODE_APOSTROPHE, key: KC.SDLK_APOSTROPHE },
  222: { scan: SC.SDL_SCANCODE_NONUSHASH, key: KC.SDLK_HASH },

  // 16: Shift,
  220: { scan: SC.SDL_SCANCODE_NONUSBACKSLASH, key: KC.SDLK_BACKSLASH },
  90: { scan: SC.SDL_SCANCODE_Z, key: KC.SDLK_Z },
  88: { scan: SC.SDL_SCANCODE_X, key: KC.SDLK_X },
  67: { scan: SC.SDL_SCANCODE_C, key: KC.SDLK_C },
  86: { scan: SC.SDL_SCANCODE_V, key: KC.SDLK_V },
  66: { scan: SC.SDL_SCANCODE_B, key: KC.SDLK_B },
  78: { scan: SC.SDL_SCANCODE_N, key: KC.SDLK_N },
  77: { scan: SC.SDL_SCANCODE_M, key: KC.SDLK_M },
  188: { scan: SC.SDL_SCANCODE_COMMA, key: KC.SDLK_COMMA },
  190: { scan: SC.SDL_SCANCODE_PERIOD, key: KC.SDLK_PERIOD },
  191: { scan: SC.SDL_SCANCODE_SLASH, key: KC.SDLK_SLASH },

  // 17: Control,
  // 91: Meta,
  32: { scan: SC.SDL_SCANCODE_SPACE, key: KC.SDLK_SPACE },
  93: { scan: SC.SDL_SCANCODE_APPLICATION, key: KC.SDLK_APPLICATION },

  45: { scan: SC.SDL_SCANCODE_INSERT, key: KC.SDLK_INSERT },
  36: { scan: SC.SDL_SCANCODE_HOME, key: KC.SDLK_HOME },
  33: { scan: SC.SDL_SCANCODE_PAGEUP, key: KC.SDLK_PAGEUP },
  46: { scan: SC.SDL_SCANCODE_DELETE, key: KC.SDLK_DELETE },
  35: { scan: SC.SDL_SCANCODE_END, key: KC.SDLK_END },
  34: { scan: SC.SDL_SCANCODE_PAGEDOWN, key: KC.SDLK_PAGEDOWN },

  38: { scan: SC.SDL_SCANCODE_UP, key: KC.SDLK_UP },
  37: { scan: SC.SDL_SCANCODE_LEFT, key: KC.SDLK_LEFT },
  40: { scan: SC.SDL_SCANCODE_DOWN, key: KC.SDLK_DOWN },
  39: { scan: SC.SDL_SCANCODE_RIGHT, key: KC.SDLK_RIGHT },

  144: { scan: SC.SDL_SCANCODE_NUMLOCKCLEAR, key: KC.SDLK_NUMLOCKCLEAR },
  111: { scan: SC.SDL_SCANCODE_KP_DIVIDE, key: KC.SDLK_KP_DIVIDE },
  106: { scan: SC.SDL_SCANCODE_KP_MULTIPLY, key: KC.SDLK_KP_MULTIPLY },
  109: { scan: SC.SDL_SCANCODE_KP_MINUS, key: KC.SDLK_KP_MINUS },
  103: { scan: SC.SDL_SCANCODE_KP_7, key: KC.SDLK_KP_7 },
  104: { scan: SC.SDL_SCANCODE_KP_8, key: KC.SDLK_KP_8 },
  105: { scan: SC.SDL_SCANCODE_KP_9, key: KC.SDLK_KP_9 },
  107: { scan: SC.SDL_SCANCODE_KP_PLUS, key: KC.SDLK_KP_PLUS },
  100: { scan: SC.SDL_SCANCODE_KP_4, key: KC.SDLK_KP_4 },
  101: { scan: SC.SDL_SCANCODE_KP_5, key: KC.SDLK_KP_5 },
  12: { scan: SC.SDL_SCANCODE_KP_CLEAR, key: KC.SDLK_KP_CLEAR },
  102: { scan: SC.SDL_SCANCODE_KP_6, key: KC.SDLK_KP_6 },
  97: { scan: SC.SDL_SCANCODE_KP_1, key: KC.SDLK_KP_1 },
  98: { scan: SC.SDL_SCANCODE_KP_2, key: KC.SDLK_KP_2 },
  99: { scan: SC.SDL_SCANCODE_KP_3, key: KC.SDLK_KP_3 },
  // 13: Enter,
  96: { scan: SC.SDL_SCANCODE_KP_0, key: KC.SDLK_KP_0 },
  110: { scan: SC.SDL_SCANCODE_KP_DECIMAL, key: KC.SDLK_KP_DECIMAL },
};

const specialCodes: Record<string, KeyData> = {
  Enter: { scan: SC.SDL_SCANCODE_RETURN, key: KC.SDLK_RETURN },
  NumpadEnter: { scan: SC.SDL_SCANCODE_KP_ENTER, key: KC.SDLK_KP_ENTER },

  AltLeft: {
    scan: SC.SDL_SCANCODE_LALT,
    key: KC.SDLK_LALT,
    mod: KM.SDL_KMOD_LALT,
  },
  AltRight: {
    scan: SC.SDL_SCANCODE_RALT,
    key: KC.SDLK_RALT,
    mod: KM.SDL_KMOD_RALT,
  },
  ControlLeft: {
    scan: SC.SDL_SCANCODE_LCTRL,
    key: KC.SDLK_LCTRL,
    mod: KM.SDL_KMOD_LCTRL,
  },
  ControlRight: {
    scan: SC.SDL_SCANCODE_RCTRL,
    key: KC.SDLK_RCTRL,
    mod: KM.SDL_KMOD_RCTRL,
  },
  MetaLeft: {
    scan: SC.SDL_SCANCODE_LGUI,
    key: KC.SDLK_LGUI,
    mod: KM.SDL_KMOD_LGUI,
  },
  MetaRight: {
    scan: SC.SDL_SCANCODE_RGUI,
    key: KC.SDLK_RGUI,
    mod: KM.SDL_KMOD_RGUI,
  },
  ShiftLeft: {
    scan: SC.SDL_SCANCODE_LSHIFT,
    key: KC.SDLK_LSHIFT,
    mod: KM.SDL_KMOD_LSHIFT,
  },
  ShiftRight: {
    scan: SC.SDL_SCANCODE_RSHIFT,
    key: KC.SDLK_RSHIFT,
    mod: KM.SDL_KMOD_RSHIFT,
  },
};

function getCodes(e: KeyboardEvent) {
  const data = codes[e.keyCode];
  if (data) return data;

  const special = specialCodes[e.code];
  if (special) return special;

  console.warn(`No known scan/key code for ${e.keyCode}/${e.code}/${e.key}`);
}

export default class KeyboardListener {
  mod: KM;
  ptr: Ptr;

  constructor(
    private allocator: Allocator,
    element: HTMLElement,
    private events: SDL_Event[],
  ) {
    this.mod = 0;
    this.ptr = allocator.calloc(512);

    element.addEventListener("keydown", this.keyDown);
    element.addEventListener("keyup", this.keyUp);
  }

  get view() {
    return new DataView(this.allocator.mem.buffer, this.ptr);
  }

  keyDown = (e: KeyboardEvent) => {
    const c = getCodes(e);
    if (c) {
      if (c.mod) this.mod |= c.mod;

      this.view.setInt32(c.scan, 1, true);
      this.events.push(
        new SDL_KeyboardEvent(
          SDL_EventType.SDL_EVENT_KEY_DOWN,
          0,
          0,
          c.scan,
          c.key,
          this.mod,
          e.keyCode,
          true,
          e.repeat,
        ),
      );
    }
  };

  keyUp = (e: KeyboardEvent) => {
    const c = getCodes(e);
    if (c) {
      if (c.mod) this.mod &= ~c.mod;

      this.view.setInt32(c.scan, 0, true);
      this.events.push(
        new SDL_KeyboardEvent(
          SDL_EventType.SDL_EVENT_KEY_UP,
          0,
          0,
          c.scan,
          c.key,
          this.mod,
          e.keyCode,
          false,
          e.repeat,
        ),
      );
    }
  };
}
