import { CSuit, ctool } from "shared";
import { usingGameContext } from "./game/shanghai";
import { getDefaultConfiguration, startGame } from "./game/shanghaiGameConfig";

const options = getDefaultConfiguration('player')
const game = startGame({
    options,
    startedAt: new Date(),
    updatedAt: new Date(),
    id: 'id',
    name: 'name'
})

const main = () => {
    if (!game.state) {
        return
    }

    game.options.rounds[0] = {
        ...game.options.rounds[0],
        melds: [
            {
                type: 'straight',
                length: 4
            }
        ]
    }

    game.state.roundNumber = 0
    game.state.roundIsOn = true

    const player = game.state.players[0]
    player.melded = [
        {
            cards: [
                ctool.fromValues(2, CSuit.heart, 0),
                ctool.fromValues(3, CSuit.heart, 0),
                ctool.fromValues(25, CSuit.heart, 0),
                ctool.fromValues(5, CSuit.heart, 0)
            ]
        }
    ]

    const card = ctool.fromValues(4, CSuit.heart, 0)
    player.cards.push(card)

    usingGameContext(game.options, game.state, (handle) => {
        const res = handle({
            gameId: 'id',
            playerId: 0,
            addToMeld: {
                targetPlayerId: 0,
                targetMeldIndex: 0,
                cardToMeldId: card.id,
                replaceJoker: true
            }
        })

        console.log({ res })
    })
}

main()
