const std = @import("std");
const sdl = @cImport({
    @cInclude("SDL3/SDL_image.h");
});

const window_width = 800;
const window_height = 600;

fn load_texture_from_file(renderer: *sdl.SDL_Renderer, path: [*c]const u8) !*sdl.SDL_Texture {
    const surface = sdl.IMG_Load(path);
    if (surface == null) {
        std.debug.print("IMG_Load: {s}\n", .{sdl.SDL_GetError()});
        return error.IMG_Load;
    }

    if (!sdl.SDL_SetSurfaceColorKey(surface, true, sdl.SDL_MapSurfaceRGB(surface, 0, 0xff, 0xff))) {
        std.debug.print("SDL_SetSurfaceColorKey: {s}", .{sdl.SDL_GetError()});

        sdl.SDL_DestroySurface(surface);
        return error.SDL_SetSurfaceColorKey;
    }

    const texture = sdl.SDL_CreateTextureFromSurface(renderer, surface);
    if (texture == null) {
        std.debug.print("SDL_CreateTextureFromSurface: {s}", .{sdl.SDL_GetError()});

        sdl.SDL_DestroySurface(surface);
        return error.SDL_CreateTextureFromSurface;
    }
    sdl.SDL_DestroySurface(surface);

    return texture;
}

pub const Engine = extern struct {
    window: *sdl.SDL_Window,
    renderer: *sdl.SDL_Renderer,
    bg_texture: *sdl.SDL_Texture,
    char_texture: *sdl.SDL_Texture,
    char_rect: sdl.SDL_FRect,
    running: bool,

    pub fn init() !Engine {
        if (!sdl.SDL_Init(sdl.SDL_INIT_VIDEO)) {
            std.debug.print("SDL_Init: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_Init;
        }
        errdefer sdl.SDL_Quit();

        const window = sdl.SDL_CreateWindow("Zig + SDL3", window_width, window_height, 0);
        if (window == null) {
            std.debug.print("SDL_CreateWindow: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_CreateWindow;
        }
        errdefer sdl.SDL_DestroyWindow(window);

        const renderer = sdl.SDL_CreateRenderer(window, null);
        if (renderer == null) {
            std.debug.print("SDL_CreateRenderer: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_CreateRenderer;
        }
        errdefer sdl.SDL_DestroyRenderer(renderer);

        const desired = sdl.IMG_INIT_PNG;
        const loaded = sdl.IMG_Init(desired);
        if ((loaded & desired) != desired) {
            std.log.debug("IMG_Init: {s}", .{sdl.SDL_GetError()});
            return error.IMG_Init;
        }
        errdefer sdl.IMG_Quit();

        const bg_texture = try load_texture_from_file(renderer.?, "res/background.png");
        errdefer sdl.SDL_DestroyTexture(bg_texture);

        const char_texture = try load_texture_from_file(renderer.?, "res/char.png");
        errdefer sdl.SDL_DestroyTexture(char_texture);

        return Engine{
            .window = window.?,
            .renderer = renderer.?,
            .bg_texture = bg_texture,
            .char_texture = char_texture,
            .char_rect = sdl.SDL_FRect{ .x = 240, .y = 190, .w = @floatFromInt(char_texture.w), .h = @floatFromInt(char_texture.h) },
            .running = false,
        };
    }

    pub fn deinit(self: *Engine) void {
        sdl.SDL_DestroyTexture(self.char_texture);
        sdl.SDL_DestroyTexture(self.bg_texture);
        sdl.SDL_DestroyRenderer(self.renderer);
        sdl.SDL_DestroyWindow(self.window);
        sdl.IMG_Quit();
        sdl.SDL_Quit();
    }

    pub fn run(self: *Engine) void {
        self.running = true;
        while (self.running) self.tick();
    }

    pub fn tick(self: *Engine) void {
        var e: sdl.SDL_Event = undefined;
        while (sdl.SDL_PollEvent(&e)) {
            if (e.type == sdl.SDL_EVENT_QUIT) {
                self.running = false;
                return;
            }
        }

        const things = sdl.SDL_GetKeyboardState(null);
        if (things[sdl.SDL_SCANCODE_LEFT] and self.char_rect.x >= 10) {
            self.char_rect.x -= 1;
        } else if (things[sdl.SDL_SCANCODE_RIGHT] and self.char_rect.x <= window_width - 10) {
            self.char_rect.x += 1;
        }
        if (things[sdl.SDL_SCANCODE_UP] and self.char_rect.y >= 10) {
            self.char_rect.y -= 1;
        } else if (things[sdl.SDL_SCANCODE_DOWN] and self.char_rect.y <= window_height - 10) {
            self.char_rect.y += 1;
        }

        _ = sdl.SDL_SetRenderDrawColor(self.renderer, 0xff, 0xff, 0xff, 0xff);
        _ = sdl.SDL_RenderClear(self.renderer);

        var dest = sdl.SDL_FRect{
            .x = 0,
            .y = 0,
            .w = @floatFromInt(self.bg_texture.w),
            .h = @floatFromInt(self.bg_texture.h),
        };
        _ = sdl.SDL_RenderTexture(self.renderer, self.bg_texture, null, &dest);

        _ = sdl.SDL_RenderTexture(self.renderer, self.char_texture, null, &self.char_rect);

        _ = sdl.SDL_RenderPresent(self.renderer);
    }
};
