export const getDefaultConfiguration = (): ShanghaiOptions => ({
    players: ["Eetu, Veikka, Niko, Johannes"],
    deckCount: 2,
    jokerCount: 4,
    shanghaiCount: 3,
    rounds: defaultRounds
})

const defaultRounds: RoundConfig[] = [
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
]
