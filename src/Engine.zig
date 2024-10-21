const std = @import("std");
const sdl = @cImport({
    @cInclude("SDL3/SDL_image.h");
});

const Texture = @import("./Texture.zig").Texture;

const window_width = 800;
const window_height = 600;

pub const Engine = struct {
    window: *sdl.SDL_Window,
    renderer: *sdl.SDL_Renderer,
    bg_texture: Texture,
    char_texture: Texture,
    char_x: f32,
    char_y: f32,
    running: bool,

    pub fn init() !Engine {
        if (!sdl.SDL_SetAppMetadata("Space Colony TCG", "0.1.0", "com.sadfolks.spacecolonytcg"))
            std.log.debug("SDL_SetAppMetadata: {s}", .{sdl.SDL_GetError()});
        if (!sdl.SDL_SetAppMetadataProperty(sdl.SDL_PROP_APP_METADATA_CREATOR_STRING, "Sad Folks"))
            std.log.debug("SDL_SetAppMetadataProperty creator: {s}", .{sdl.SDL_GetError()});
        if (!sdl.SDL_SetAppMetadataProperty(sdl.SDL_PROP_APP_METADATA_TYPE_STRING, "game"))
            std.log.debug("SDL_SetAppMetadataProperty type: {s}", .{sdl.SDL_GetError()});

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

        const maybe_renderer = sdl.SDL_CreateRenderer(window, null);
        if (maybe_renderer == null) {
            std.debug.print("SDL_CreateRenderer: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_CreateRenderer;
        }
        errdefer sdl.SDL_DestroyRenderer(maybe_renderer);
        const renderer = maybe_renderer.?;

        const desired = sdl.IMG_INIT_PNG;
        const loaded = sdl.IMG_Init(desired);
        if ((loaded & desired) != desired) {
            std.log.debug("IMG_Init: {s}", .{sdl.SDL_GetError()});
            return error.IMG_Init;
        }
        errdefer sdl.IMG_Quit();

        var bg_texture = try Texture.load_from_file(renderer, "res/background.png");
        errdefer bg_texture.deinit();

        var char_texture = try Texture.load_from_file(renderer, "res/char.png");
        errdefer char_texture.deinit();

        return Engine{
            .window = window.?,
            .renderer = renderer,
            .bg_texture = bg_texture,
            .char_texture = char_texture,
            .char_x = 240,
            .char_y = 190,
            .running = false,
        };
    }

    pub fn deinit(self: *Engine) void {
        self.char_texture.deinit();
        self.bg_texture.deinit();
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
        if (things[sdl.SDL_SCANCODE_LEFT] and self.char_x >= 10) {
            self.char_x -= 1;
        } else if (things[sdl.SDL_SCANCODE_RIGHT] and self.char_x <= window_width - 10) {
            self.char_x += 1;
        }
        if (things[sdl.SDL_SCANCODE_UP] and self.char_y >= 10) {
            self.char_y -= 1;
        } else if (things[sdl.SDL_SCANCODE_DOWN] and self.char_y <= window_height - 10) {
            self.char_y += 1;
        }

        _ = sdl.SDL_SetRenderDrawColor(self.renderer, 0xff, 0xff, 0xff, 0xff);
        _ = sdl.SDL_RenderClear(self.renderer);

        self.bg_texture.render(0, 0);
        self.char_texture.render(self.char_x, self.char_y);

        _ = sdl.SDL_RenderPresent(self.renderer);
    }
};
