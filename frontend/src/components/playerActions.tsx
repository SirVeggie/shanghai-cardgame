import style from './playerActions.module.scss'
import { useContext } from "react"
import { GameContext } from "../context/gameContext"
import { ActionResponse, AddToMeldAction, MeldAction } from '../shared'
import { executePlayerAction } from '../services/gameApi'

type ActionCallback = (s: ActionResponse) => void
type ButtonConfig = {
    label: string,
    onClick: (s: unknown) => void
}

export const PlayerActions = () => {
    const { myPlayerId, setActionResponse, selectedCard, game: { id: gameId } } = useContext(GameContext)

    const buttons: ButtonConfig[] = [
        {
            label: "Reveal card from deck",
            onClick: () => actionRevealDeck(setActionResponse, gameId, myPlayerId)
        },
        {
            label: "Allow Shanghai",
            onClick: () => actionAllowShanghai(setActionResponse, gameId, myPlayerId)
        },
        {
            label: "Discard card",
            onClick: () => {
                const cardID = selectedCard.selectedCardID ?? selectedCard.actionHighlightCardID
                if (!cardID) {
                    return
                }
                actionDiscardCard(setActionResponse, gameId, myPlayerId, cardID)
            }
        },
        {
            label: "Set ready",
            onClick: () => actionSetReady(setActionResponse, gameId, myPlayerId)
        }
    ]

    return <div className={style.buttons}>
        {buttons.map((button, i) =>
            <button onClick={button.onClick} key={`action-${i}`} className={style.button}>
                {button.label}
            </button>
        )}
    </div>
}

export const actionSetReady = async (cb: ActionCallback, gameId: string, playerId: number) => {
    const res = await executePlayerAction({
        gameId,
        playerId,
        setReady: true
    })
    cb(res)
}

export const actionRevealDeck = async (cb: ActionCallback, gameId: string, playerId: number) => {
    const res = await executePlayerAction({
        gameId,
        playerId,
        revealDeck: true
    })
    cb(res)
}

export const actionTakeDiscard = async (cb: ActionCallback, gameId: string, playerId: number) => {
    const res = await executePlayerAction({
        gameId,
        playerId,
        takeDiscard: true
    })
    cb(res)
}

export const actionTakeDeck = async (cb: ActionCallback, gameId: string, playerId: number) => {
    const res = await executePlayerAction({
        gameId,
        playerId,
        takeDeck: true
    })
    cb(res)
}

export const actionMeld = async (cb: ActionCallback, gameId: string, playerId: number, meldAction: MeldAction) => {
    const res = await executePlayerAction({
        gameId,
        playerId,
        meld: meldAction
    })
    cb(res)
}

export const actionAddToMeld = async (cb: ActionCallback, gameId: string, playerId: number, meldAction: AddToMeldAction) => {
    const res = await executePlayerAction({
        gameId,
        playerId,
        addToMeld: meldAction
    })
    cb(res)
}

export const actionDiscardCard = async (cb: ActionCallback, gameId: string, playerId: number, discardID: number) => {
    const res = await executePlayerAction({
        gameId,
        playerId,
        discardID
    })
    cb(res)
}

export const actionCallShanghai = async (cb: ActionCallback, gameId: string, playerId: number) => {
    const res = await executePlayerAction({
        gameId,
        playerId,
        shanghai: true
    })
    cb(res)
}

export const actionAllowShanghai = async (cb: ActionCallback, gameId: string, playerId: number) => {
    const res = await executePlayerAction({
        gameId,
        playerId,
        allowShanghai: true
    })
    cb(res)
}

