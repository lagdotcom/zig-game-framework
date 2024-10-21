const std = @import("std");
const sdl = @import("sdl.zig").sdl;

const Texture = @import("Texture.zig").Texture;

const window_width = 800;
const window_height = 600;

var str_buffer = [_]u8{0} ** 128;

pub const Engine = struct {
    running: bool,
    window: ?*sdl.SDL_Window,
    renderer: ?*sdl.SDL_Renderer,
    bg_texture: Texture,
    char_texture: Texture,
    char_x: f32,
    char_y: f32,
    font: ?*sdl.TTF_Font,
    mouse_x: f32,
    mouse_y: f32,

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

        if (!sdl.TTF_Init()) {
            std.log.debug("IMG_Init: {s}", .{sdl.SDL_GetError()});
            return error.IMG_Init;
        }
        errdefer sdl.TTF_Quit();

        var bg_texture = try Texture.load_from_file(renderer, "res/background.png");
        errdefer bg_texture.deinit();

        var char_texture = try Texture.load_from_file(renderer, "res/char.png");
        errdefer char_texture.deinit();

        const font = sdl.TTF_OpenFont("C:\\Windows\\Fonts\\baskvill.ttf", 28);
        if (font == null) {
            std.log.debug("TTF_OpenFont: {s}", .{sdl.SDL_GetError()});
            return error.TTF_OpenFont;
        }
        errdefer sdl.TTF_CloseFont(font);

        return Engine{
            .window = window,
            .renderer = renderer,
            .bg_texture = bg_texture,
            .char_texture = char_texture,
            .font = font,
            .char_x = 240,
            .char_y = 190,
            .mouse_x = -1,
            .mouse_y = -1,
            .running = false,
        };
    }

    pub fn deinit(self: *Engine) void {
        sdl.TTF_CloseFont(self.font);
        self.char_texture.deinit();
        self.bg_texture.deinit();
        sdl.TTF_Quit();
        sdl.IMG_Quit();
        sdl.SDL_DestroyRenderer(self.renderer);
        sdl.SDL_DestroyWindow(self.window);
        sdl.SDL_Quit();
    }

    pub fn run(self: *Engine) !void {
        self.running = true;
        while (self.running) try self.tick();
    }

    pub fn tick(self: *Engine) !void {
        var e: sdl.SDL_Event = undefined;
        while (sdl.SDL_PollEvent(&e)) {
            if (e.type == sdl.SDL_EVENT_QUIT) {
                self.running = false;
                return;
            } else if (e.type == sdl.SDL_EVENT_MOUSE_MOTION) {
                self.mouse_x = e.motion.x;
                self.mouse_y = e.motion.y;
            }
        }

        const things = sdl.SDL_GetKeyboardState(null);
        if (things[sdl.SDL_SCANCODE_LEFT] and self.char_x >= 10) {
            self.char_x -= 1;
        } else if (things[sdl.SDL_SCANCODE_RIGHT] and @as(i32, @intFromFloat(self.char_x)) <= window_width - self.char_texture.width - 10) {
            self.char_x += 1;
        }
        if (things[sdl.SDL_SCANCODE_UP] and self.char_y >= 10) {
            self.char_y -= 1;
        } else if (things[sdl.SDL_SCANCODE_DOWN] and @as(i32, @intFromFloat(self.char_y)) <= window_height - self.char_texture.height - 10) {
            self.char_y += 1;
        }

        _ = sdl.SDL_SetRenderDrawColor(self.renderer, 0xff, 0xff, 0xff, 0xff);
        _ = sdl.SDL_RenderClear(self.renderer);

        self.bg_texture.render(0, 0);
        self.char_texture.render(self.char_x, self.char_y);

        _ = try std.fmt.bufPrint(&str_buffer, "mouse @{d},{d}", .{ self.mouse_x, self.mouse_y });

        const colour = sdl.SDL_Color{ .r = 11, .g = 22, .b = 33, .a = 255 };
        var blah = try Texture.load_from_text(self.renderer, self.font, &str_buffer, colour);
        blah.render(10, 10);
        blah.deinit();

        _ = sdl.SDL_RenderPresent(self.renderer);
    }
};
