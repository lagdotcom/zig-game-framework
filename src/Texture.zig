const std = @import("std");
const sdl = @import("sdl.zig").sdl;

const u = @import("utils.zig");

pub const Texture = struct {
    renderer: ?*sdl.SDL_Renderer,
    texture: [*c]sdl.SDL_Texture,
    width: c_int,
    height: c_int,

    pub fn load_from_surface(renderer: ?*sdl.SDL_Renderer, surface: [*c]sdl.SDL_Surface) !Texture {
        const texture = sdl.SDL_CreateTextureFromSurface(renderer, surface);
        if (texture == null) {
            std.log.debug("SDL_CreateTextureFromSurface: {s}", .{sdl.SDL_GetError()});
            return error.SDL_CreateTextureFromSurface;
        }

        return Texture{
            .renderer = renderer,
            .texture = texture,
            .width = surface.*.w,
            .height = surface.*.h,
        };
    }

    pub fn load_from_file(renderer: ?*sdl.SDL_Renderer, path: []const u8) !Texture {
        const surface = sdl.IMG_Load(path.ptr);
        if (surface == null) {
            std.log.debug("IMG_Load: {s}\n", .{sdl.SDL_GetError()});
            return error.IMG_Load;
        }
        defer sdl.SDL_DestroySurface(surface);

        if (!sdl.SDL_SetSurfaceColorKey(surface, true, sdl.SDL_MapSurfaceRGB(surface, 0, 0xff, 0xff))) {
            std.log.debug("SDL_SetSurfaceColorKey: {s}", .{sdl.SDL_GetError()});
            return error.SDL_SetSurfaceColorKey;
        }

        return Texture.load_from_surface(renderer, surface);
    }

    pub fn load_from_text(renderer: ?*sdl.SDL_Renderer, font: ?*sdl.TTF_Font, text: []const u8, colour: sdl.SDL_Color, wrap_width: c_int) !Texture {
        const surface = sdl.TTF_RenderText_Blended_Wrapped(font, text.ptr, text.len, colour, wrap_width);
        if (surface == null) {
            std.log.debug("TTF_RenderText_Blended: {s}\n", .{sdl.SDL_GetError()});
            return error.IMG_Load;
        }
        defer sdl.SDL_DestroySurface(surface);

        return Texture.load_from_surface(renderer, surface);
    }

    pub fn deinit(self: *Texture) void {
        sdl.SDL_DestroyTexture(self.texture);
    }

    pub fn set_color(self: *Texture, r: u8, g: u8, b: u8) void {
        _ = sdl.SDL_SetTextureColorMod(self.texture, r, g, b);
    }

    pub fn set_alpha(self: *Texture, a: u8) void {
        _ = sdl.SDL_SetTextureAlphaMod(self.texture, a);
    }

    pub fn set_blending(self: *Texture, mode: sdl.SDL_BlendMode) void {
        _ = sdl.SDL_SetTextureBlendMode(self.texture, mode);
    }

    inline fn get_destination_rect(self: *Texture, x: f32, y: f32) sdl.SDL_FRect {
        return u.frect(x, y, @floatFromInt(self.width), @floatFromInt(self.height));
    }

    pub fn render(self: *Texture, x: f32, y: f32) void {
        var dest = self.get_destination_rect(x, y);
        _ = sdl.SDL_RenderTexture(self.renderer, self.texture, null, &dest);
    }

    pub fn render_clipped(self: *Texture, x: f32, y: f32, maybe_clip: ?*sdl.SDL_FRect, width: f32, height: f32) void {
        var dest = self.get_destination_rect(x, y);

        // default to clipping rectangle
        if (maybe_clip) |clip| {
            dest.w = clip.w;
            dest.h = clip.h;
        }

        // use sizes if given
        if (width > 0) dest.w = width;
        if (height > 0) dest.h = height;

        _ = sdl.SDL_RenderTexture(self.renderer, self.texture, maybe_clip, &dest);
    }

    pub fn render_clipped_rotated(self: *Texture, x: f32, y: f32, maybe_clip: ?*sdl.SDL_FRect, width: f32, height: f32, angle: f64, centre: *sdl.SDL_FPoint, flip: sdl.SDL_FlipMode) void {
        var dest = self.get_destination_rect(x, y);

        // default to clipping rectangle
        if (maybe_clip) |clip| {
            dest.w = clip.w;
            dest.h = clip.h;
        }

        // use sizes if given
        if (width > 0) dest.w = width;
        if (height > 0) dest.h = height;

        _ = sdl.SDL_RenderTextureRotated(self.renderer, self.texture, maybe_clip, dest, angle, centre, flip);
    }
};
