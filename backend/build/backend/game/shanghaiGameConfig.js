"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultConfiguration = void 0;
const getDefaultConfiguration = () => ({
    players: ["Eetu", "Veikka", "Niko", "Johannes"],
    deckCount: 2,
    jokerCount: 4,
    shanghaiCount: 3,
    rounds: difficultGame
});
exports.getDefaultConfiguration = getDefaultConfiguration;
const testRounds = [
    {
        description: "Two sets",
        cardCount: 11,
        melds: [
            {
                type: "straight",
                length: 2
            }
        ]
    },
];
const defaultRounds = [
    {
        description: "Two sets",
        cardCount: 11,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            }
        ]
    },
    {
        description: "Set and straight",
        cardCount: 11,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "straight",
                length: 4
            }
        ]
    },
    {
        description: "Two straights",
        cardCount: 11,
        melds: [
            {
                type: "straight",
                length: 4
            },
            {
                type: "straight",
                length: 4
            }
        ]
    },
    {
        description: "Three sets",
        cardCount: 11,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            }
        ]
    },
    {
        description: "Two sets and a straight",
        cardCount: 11,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            },
            {
                type: "straight",
                length: 4
            }
        ]
    },
    {
        description: "One set and two straights",
        cardCount: 11,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "straight",
                length: 4
            },
            {
                type: "straight",
                length: 4
            }
        ]
    },
    {
        description: "Three straights",
        cardCount: 13,
        melds: [
            {
                type: "straight",
                length: 4
            },
            {
                type: "straight",
                length: 4
            },
            {
                type: "straight",
                length: 4
            }
        ]
    },
];
const difficultGame = [
    {
        description: "Two straights",
        cardCount: 11,
        melds: [
            {
                type: "straight",
                length: 4
            },
            {
                type: "straight",
                length: 4
            }
        ]
    },
    {
        description: "Three sets",
        cardCount: 11,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            }
        ]
    },
    {
        description: "Two sets and a straight",
        cardCount: 11,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            },
            {
                type: "straight",
                length: 4
            }
        ]
    },
    {
        description: "One set and two straights",
        cardCount: 11,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "straight",
                length: 4
            },
            {
                type: "straight",
                length: 4
            }
        ]
    },
    {
        description: "Three straights",
        cardCount: 13,
        melds: [
            {
                type: "straight",
                length: 4
            },
            {
                type: "straight",
                length: 4
            },
            {
                type: "straight",
                length: 4
            }
        ]
    },
    {
        description: "Four sets",
        cardCount: 13,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            }
        ]
    },
    {
        description: "Long straight and 2 sets",
        cardCount: 13,
        melds: [
            {
                type: "set",
                length: 3
            },
            {
                type: "set",
                length: 3
            },
            {
                type: "straight",
                length: 6
            }
        ]
    },
];
