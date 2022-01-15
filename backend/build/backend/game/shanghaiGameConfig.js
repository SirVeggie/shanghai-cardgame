"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConfig = exports.getDefaultConfiguration = void 0;
const getDefaultConfiguration = () => ({
    players: ["Eetu", "Veikka"],
    deckCount: 2,
    jokerCount: 4,
    shanghaiCount: 3,
    rounds: defaultRounds
});
exports.getDefaultConfiguration = getDefaultConfiguration;
const testConfig = () => ({
    players: ["Eetu", "Veikka"],
    deckCount: 1,
    jokerCount: 0,
    shanghaiCount: 3,
    rounds: [
        {
            description: "Two sets",
            cardCount: 5,
            melds: [
                {
                    type: "straight",
                    length: 4
                }
            ]
        },
    ]
});
exports.testConfig = testConfig;
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
