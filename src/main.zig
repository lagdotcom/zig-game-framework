const builtin = @import("builtin");
const std = @import("std");

const Engine = @import("Engine.zig").Engine;

var engine: Engine = undefined;

pub fn main() !void {
    engine = try Engine.init();

    if (!builtin.target.isWasm()) {
        defer engine.deinit();
        engine.run();
    }
}

pub export fn tick() bool {
    engine.running = true;
    engine.tick();

    return engine.running;
}
