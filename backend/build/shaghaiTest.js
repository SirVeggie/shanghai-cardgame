"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("shared");
const shanghai_1 = require("./game/shanghai");
const shanghaiGameConfig_1 = require("./game/shanghaiGameConfig");
const options = (0, shanghaiGameConfig_1.getDefaultConfiguration)('player');
const game = (0, shanghaiGameConfig_1.startGame)({
    options,
    startedAt: new Date(),
    updatedAt: new Date(),
    id: 'id',
    name: 'name'
});
const main = () => {
    if (!game.state) {
        return;
    }
    game.options.rounds[0] = Object.assign(Object.assign({}, game.options.rounds[0]), { melds: [
            {
                type: 'straight',
                length: 4
            }
        ] });
    game.state.roundNumber = 0;
    game.state.roundIsOn = true;
    const player = game.state.players[0];
    player.melded = [
        {
            cards: [
                shared_1.ctool.fromValues(2, shared_1.CSuit.heart, 0),
                shared_1.ctool.fromValues(3, shared_1.CSuit.heart, 0),
                shared_1.ctool.fromValues(25, shared_1.CSuit.heart, 0),
                shared_1.ctool.fromValues(5, shared_1.CSuit.heart, 0)
            ]
        }
    ];
    const card = shared_1.ctool.fromValues(4, shared_1.CSuit.heart, 0);
    player.cards.push(card);
    (0, shanghai_1.usingGameContext)(game.options, game.state, (handle) => {
        const res = handle({
            gameId: 'id',
            playerId: 0,
            addToMeld: {
                targetPlayerId: 0,
                targetMeldIndex: 0,
                cardToMeldId: card.id,
                replaceJoker: true
            }
        });
        console.log({ res });
    });
};
main();
