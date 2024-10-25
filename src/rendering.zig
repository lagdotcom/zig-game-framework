const std = @import("std");
const sdl = @import("sdl.zig").sdl;

const oc = @import("cards/other.zig");
const Texture = @import("Texture.zig").Texture;
const u = @import("utils.zig");

pub const window_width = 800;
pub const window_height = 600;

var str_buffer = [_]u8{0} ** 128;
pub fn temp_fmt(comptime fmt: []const u8, args: anytype) ![]u8 {
    return try std.fmt.bufPrint(&str_buffer, fmt, args);
}

const card_width = 150;
const card_height = 150;
const text_max_height = 80;
const text_max_width = card_width - 8;

const border = u.rgb(32, 32, 32);
const background = u.rgb(64, 64, 64);
const white = u.rgb(255, 255, 255);

const name_colour = white;
const cost_colour = white;
const traits_colour = white;
const text_colour = white;

fn get_traits_line(traits: []const []const u8) []const u8 {
    var i: usize = 0;
    for (traits) |trait| {
        str_buffer[i] = '[';
        i += 1;

        @memcpy(str_buffer[i .. i + trait.len], trait);
        i += trait.len;

        str_buffer[i] = ']';
        i += 1;
        str_buffer[i] = ' ';
        i += 1;
    }

    return str_buffer[0 .. i - 1];
}

pub const RenderingBundle = struct {
    renderer: ?*sdl.SDL_Renderer,
    cost_font: ?*sdl.TTF_Font,
    name_font: ?*sdl.TTF_Font,
    text_font: ?*sdl.TTF_Font,

    pub fn init(window: ?*sdl.SDL_Window) !RenderingBundle {
        const renderer = sdl.SDL_CreateRenderer(window, null);
        if (renderer == null) {
            std.log.debug("SDL_CreateRenderer: {s}\n", .{sdl.SDL_GetError()});
            return error.SDL_CreateRenderer;
        }
        errdefer sdl.SDL_DestroyRenderer(renderer);

        if (!sdl.TTF_Init()) {
            std.log.debug("TTF_Init: {s}", .{sdl.SDL_GetError()});
            return error.TTF_Init;
        }
        errdefer sdl.TTF_Quit();

        const cost_font = sdl.TTF_OpenFont("C:\\Windows\\Fonts\\baskvill.ttf", 28);
        if (cost_font == null) {
            std.log.debug("TTF_OpenFont cost: {s}", .{sdl.SDL_GetError()});
            return error.TTF_OpenFont;
        }
        errdefer sdl.TTF_CloseFont(cost_font);

        const name_font = sdl.TTF_OpenFont("C:\\Windows\\Fonts\\baskvill.ttf", 16);
        if (name_font == null) {
            std.log.debug("TTF_OpenFont name: {s}", .{sdl.SDL_GetError()});
            return error.TTF_OpenFont;
        }
        errdefer sdl.TTF_CloseFont(name_font);

        const text_font = sdl.TTF_OpenFont("C:\\Windows\\Fonts\\baskvill.ttf", 14);
        if (text_font == null) {
            std.log.debug("TTF_OpenFont text: {s}", .{sdl.SDL_GetError()});
            return error.TTF_OpenFont;
        }
        errdefer sdl.TTF_CloseFont(text_font);

        return RenderingBundle{
            .renderer = renderer,
            .cost_font = cost_font,
            .name_font = name_font,
            .text_font = text_font,
        };
    }

    pub fn deinit(self: RenderingBundle) void {
        sdl.TTF_CloseFont(self.text_font);
        sdl.TTF_CloseFont(self.name_font);
        sdl.TTF_CloseFont(self.cost_font);
        sdl.TTF_Quit();
        sdl.SDL_DestroyRenderer(self.renderer);
    }

    inline fn rect(self: RenderingBundle, colour: sdl.SDL_Color, x: f32, y: f32, w: f32, h: f32) !void {
        if (!sdl.SDL_SetRenderDrawColor(self.renderer, colour.r, colour.g, colour.b, colour.a)) {
            std.log.debug("SDL_SetRenderDrawColor: {s}", .{sdl.SDL_GetError()});
            return error.SDL_SetRenderDrawColor;
        }

        if (!sdl.SDL_RenderFillRect(self.renderer, &u.frect(x, y, w, h))) {
            std.log.debug("SDL_RenderFillRect: {s}", .{sdl.SDL_GetError()});
            return error.SDL_RenderFillRect;
        }
    }

    pub inline fn render_card(self: RenderingBundle, x: f32, y: f32, card: oc.Card) !void {
        try self.render_card_data(x, y, card.name, card.type, if (card.type == .Luck) null else card.cost, card.traits, card.text);
    }

    pub fn render_card_data(self: RenderingBundle, x: f32, y: f32, name: []const u8, ctype: oc.CardType, maybe_cost: ?c_int, traits: []const []const u8, text: []const u8) !void {
        try self.rect(border, x, y, card_width, card_height);
        try self.rect(background, x + 2, y + 2, card_width - 4, card_height - 4);

        _ = sdl.SDL_SetRenderClipRect(self.renderer, &u.rect(@intFromFloat(x + 4), @intFromFloat(y + 4), card_width - 8, card_height - 6));
        defer _ = sdl.SDL_SetRenderClipRect(self.renderer, null);

        const wrap_width: c_int = if (maybe_cost == null) card_width - 4 else card_height - 24;

        var name_text = try Texture.load_from_text(self.renderer, self.name_font, name, name_colour, wrap_width);
        defer name_text.deinit();
        name_text.render(x + 4, y + 4);

        if (maybe_cost) |cost| {
            var texture = try Texture.load_from_text(self.renderer, self.cost_font, try temp_fmt("{d}", .{cost}), cost_colour, 0);
            defer texture.deinit();
            texture.render(x + card_width - 2 - @as(f32, @floatFromInt(texture.width)), y + 4);
        }

        if (traits.len > 0) {
            var texture = try Texture.load_from_text(self.renderer, self.text_font, get_traits_line(traits), traits_colour, text_max_width);
            defer texture.deinit();

            texture.render(x + 4, y + 4 + @as(f32, @floatFromInt(name_text.height)));
        }

        if (text.len > 0) {
            var texture = try Texture.load_from_text(self.renderer, self.text_font, text, text_colour, text_max_width);
            defer texture.deinit();

            const height: f32 = @floatFromInt(@min(text_max_height, texture.height));

            var text_rect = u.frect(0, 0, @floatFromInt(texture.width), height);
            texture.render_clipped(x + 4, y + card_height - text_max_height, &text_rect, 0, height);
        }

        _ = ctype;
    }
};
