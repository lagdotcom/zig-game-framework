pub const Faction = struct {
    name: []const u8,
    credit: c_int,
    knowledge: c_int,
    text: []const u8,
};

pub const factions = .{
    Faction{
        .name = "Defectors",
        .credit = 2,
        .knowledge = 5,
        .text = "Action: Spend two Personnel to draw a card.",
    },
    Faction{
        .name = "Growers",
        .credit = 2,
        .knowledge = 6,
        .text = "Action: Spend a Personnel to place a pip at their location.",
    },
    Faction{
        .name = "Imperials",
        .credit = 4,
        .knowledge = 6,
        .text = "You may only Tax Worlds with your Personnel present.",
    },
    Faction{
        .name = "League of Minor Planets",
        .credit = 2,
        .knowledge = 6,
        .text = "When a [Low Gravity] World is played, place 2 pips there.",
    },
    Faction{
        .name = "Mercenaries",
        .credit = 3,
        .knowledge = 6,
        .text = "When you win a battle, you may draw a card.",
    },
    Faction{
        .name = "Nomads",
        .credit = 1,
        .knowledge = 6,
        .text = "You may ignore rules of Worlds with [Extreme Conditions].",
    },
    Faction{
        .name = "Syndicate",
        .credit = 3,
        .knowledge = 5,
        .text = "[Illegal] Equipment have their Cost reduced by 1.",
    },
};
