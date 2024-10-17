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

    const texture = sdl.SDL_CreateTextureFromSurface(renderer, surface);
    if (texture == null) {
        sdl.SDL_DestroySurface(surface);

        std.debug.print("SDL_CreateTextureFromSurface: {s}", .{sdl.SDL_GetError()});
        return error.SDL_CreateTextureFromSurface;
    }
    sdl.SDL_DestroySurface(surface);

    return texture;
}

pub const Engine = extern struct {
    window: *sdl.SDL_Window,
    renderer: *sdl.SDL_Renderer,
    bg_texture: *sdl.SDL_Texture,
    up_texture: *sdl.SDL_Texture,
    right_texture: *sdl.SDL_Texture,
    left_texture: *sdl.SDL_Texture,
    down_texture: *sdl.SDL_Texture,
    current_texture: *sdl.SDL_Texture,
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

        const bg_texture = try load_texture_from_file(renderer.?, "res/png.png");
        errdefer sdl.SDL_DestroyTexture(bg_texture);

        const up_texture = try load_texture_from_file(renderer.?, "res/up.png");
        errdefer sdl.SDL_DestroyTexture(up_texture);

        const right_texture = try load_texture_from_file(renderer.?, "res/right.png");
        errdefer sdl.SDL_DestroyTexture(right_texture);

        const left_texture = try load_texture_from_file(renderer.?, "res/left.png");
        errdefer sdl.SDL_DestroyTexture(left_texture);

        const down_texture = try load_texture_from_file(renderer.?, "res/down.png");
        errdefer sdl.SDL_DestroyTexture(down_texture);

        return Engine{
            .window = window.?,
            .renderer = renderer.?,
            .bg_texture = bg_texture,
            .up_texture = up_texture,
            .right_texture = right_texture,
            .left_texture = left_texture,
            .down_texture = down_texture,
            .current_texture = bg_texture,
            .running = false,
        };
    }

    pub fn deinit(self: *Engine) void {
        sdl.SDL_DestroyTexture(self.down_texture);
        sdl.SDL_DestroyTexture(self.left_texture);
        sdl.SDL_DestroyTexture(self.right_texture);
        sdl.SDL_DestroyTexture(self.up_texture);
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
            } else if (e.type == sdl.SDL_EVENT_KEY_DOWN) {
                if (e.key.key == sdl.SDLK_UP) {
                    self.current_texture = self.up_texture;
                } else if (e.key.key == sdl.SDLK_RIGHT) {
                    self.current_texture = self.right_texture;
                } else if (e.key.key == sdl.SDLK_LEFT) {
                    self.current_texture = self.left_texture;
                } else if (e.key.key == sdl.SDLK_DOWN) {
                    self.current_texture = self.down_texture;
                }
            }
        }

        var bg = sdl.SDL_Color{ .r = 0xff, .g = 0xff, .b = 0xff, .a = 0xff };

        const keystates = sdl.SDL_GetKeyboardState(null);
        if (keystates[sdl.SDL_SCANCODE_UP]) {
            bg.g = 0x7f;
            bg.b = 0;
        } else if (keystates[sdl.SDL_SCANCODE_RIGHT]) {
            bg.g = 0;
            bg.b = 0;
        } else if (keystates[sdl.SDL_SCANCODE_LEFT]) {
            bg.r = 0;
            bg.g = 0x7f;
            bg.b = 0;
        } else if (keystates[sdl.SDL_SCANCODE_DOWN]) {
            bg.r = 0;
            bg.g = 0;
        }

        _ = sdl.SDL_SetRenderDrawColor(self.renderer, bg.r, bg.g, bg.b, 0xff);
        _ = sdl.SDL_RenderClear(self.renderer);

        const rect = sdl.SDL_FRect{
            .w = @floatFromInt(self.current_texture.w),
            .h = @floatFromInt(self.current_texture.h),
            .x = @as(f32, @floatFromInt(window_width - self.current_texture.w)) / 2,
            .y = @as(f32, @floatFromInt(window_height - self.current_texture.h)) / 2,
        };
        _ = sdl.SDL_RenderTexture(self.renderer, self.current_texture, null, &rect);

        _ = sdl.SDL_RenderPresent(self.renderer);
    }
};
