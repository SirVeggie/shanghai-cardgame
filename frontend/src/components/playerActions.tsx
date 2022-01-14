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
    const { myPlayerName, setActionResponse } = useContext(GameContext)

    const buttons: ButtonConfig[] = [
        {
            label: "Call Shanghai!",
            onClick: () => actionCallShanghai(setActionResponse, myPlayerName)
        },
        {
            label: "Take from discard pile",
            onClick: () => actionTakeDiscard(setActionResponse, myPlayerName)
        },
        {
            label: "Take from deck",
            onClick: () => actionTakeDeck(setActionResponse, myPlayerName)
        },
        {
            label: "Reveal card from deck",
            onClick: () => actionRevealDeck(setActionResponse, myPlayerName)
        },
        {
            label: "Meld card sets",
            onClick: () => { }
        },
        {
            label: "Meld single card",
            onClick: () => { }
        },
        {
            label: "Allow Shanghai",
            onClick: () => actionAllowShanghai(setActionResponse, myPlayerName)
        },
        {
            label: "Discard card",
            onClick: () => { }
        },
        {
            label: "Set ready",
            onClick: () => actionSetReady(setActionResponse, myPlayerName)
        }
    ]

    console.log({ buttons })

    return <div className={style.buttons}>
        {buttons.map((button, i) =>
            <button onClick={button.onClick} key={`action-${i}`} className={style.button}>
                {button.label}
            </button>
        )}
    </div>
}

export const actionSetReady = async (cb: ActionCallback, playerName: string) => {
    const res = await executePlayerAction({
        playerName,
        setReady: true
    })
    cb(res)
}

export const actionRevealDeck = async (cb: ActionCallback, playerName: string) => {
    const res = await executePlayerAction({
        playerName,
        revealDeck: true
    })
    cb(res)
}

export const actionTakeDiscard = async (cb: ActionCallback, playerName: string) => {
    const res = await executePlayerAction({
        playerName,
        takeDiscard: true
    })
    cb(res)
}

export const actionTakeDeck = async (cb: ActionCallback, playerName: string) => {
    const res = await executePlayerAction({
        playerName,
        takeDeck: true
    })
    cb(res)
}

export const actionMeld = async (cb: ActionCallback, playerName: string, meldAction: MeldAction) => {
    const res = await executePlayerAction({
        playerName,
        meld: meldAction
    })
    cb(res)
}

export const actionAddToMeld = async (cb: ActionCallback, playerName: string, meldAction: AddToMeldAction) => {
    const res = await executePlayerAction({
        playerName,
        addToMeld: meldAction
    })
    cb(res)
}

export const actionDiscardCard = async (cb: ActionCallback, playerName: string, discardID: number) => {
    const res = await executePlayerAction({
        playerName,
        discardID
    })
    cb(res)
}

export const actionCallShanghai = async (cb: ActionCallback, playerName: string) => {
    const res = await executePlayerAction({
        playerName,
        shanghai: true
    })
    cb(res)
}

export const actionAllowShanghai = async (cb: ActionCallback, playerName: string) => {
    const res = await executePlayerAction({
        playerName,
        allowShanghai: true
    })
    cb(res)
}

