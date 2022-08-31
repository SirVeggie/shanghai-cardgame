import { Action, GamePlayer, ShanghaiOptions, ShanghaiState } from "shared";

export type AIActionResponse = Omit<Action, "gameId" | "playerId">
export type AIInput = {
  aiID: number,
  player: GamePlayer
  options: ShanghaiOptions
  state: ShanghaiState
}

export type AISimpleAction = (input: AIInput) => boolean
export type AIAction = (input: AIInput) => AIActionResponse

export type ShanghaiAI = {
  takeCard: AIAction
  meldOrDiscard: AIAction
  callShanghai: AISimpleAction
  respondToShanghai: AISimpleAction
}

export const dumbAi: ShanghaiAI = {
  takeCard: (input) =>{
    return {
      takeDeck: true
    }
  },
  meldOrDiscard: (input) => {
    return {
      discardID: input.player.cards[0].id
    }
  },
  callShanghai: (input) => {
    return false
  },
  respondToShanghai: (input) => {
    return true
  }
}