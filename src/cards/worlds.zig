const t = @import("traits.zig");

pub const World = struct {
    name: []const u8,
    size: c_int,
    prestige: c_int,
    traits: [][]const u8,
    text: []const u8,
};

pub const worlds = .{
    World{
        .name = "Desginer Dwarf",
        .size = 1,
        .prestige = 1,
        .traits = &[_][]const u8{t.LowGravity},
        .text = "",
    },
    World{
        .name = "Hellhole",
        .size = 5,
        .prestige = 2,
        .traits = &[_][]const u8{ t.ExtremeConditions, t.MilitaryResource },
        .text = "Growth: Each player chooses to destroy all their pips or one of their assigned Personnel.",
    },
    World{
        .name = "Primaeval Garden",
        .size = 4,
        .prestige = 3,
        .traits = &[_][]const u8{},
        .text = "Growth: If fewer than 4 pips would be placed here, place 4.",
    },
    World{
        .name = "Quantum Moon",
        .size = 2,
        .prestige = 1,
        .traits = &[_][]const u8{t.LowGravity},
        .text = "Ready: Assign one of your Personnel to this World. Personnel may not be Reassigned here in other ways.",
    },
    World{
        .name = "Rocky Giant",
        .size = 8,
        .prestige = 2,
        .traits = &[_][]const u8{t.HighGravity},
        .text = "",
    },
    World{
        .name = "Shattered Planet",
        .size = 4,
        .prestige = 0,
        .traits = &[_][]const u8{t.ExtremeConditions},
        .text = "Ready: Remove any pip from this World.",
    },
    World{
        .name = "Sparse Asteroid Belt",
        .size = 2,
        .prestige = 0,
        .traits = &[_][]const u8{t.LowGravity},
        .text = "When an attack is resolved here, it results in one fewer casualty.",
    },
};
