import { compact, filter, find, flatMap, map, minBy, orderBy, remove, some, uniq, uniqBy } from 'lodash'

let game: ShanghaiOptions
let state: ShanghaiState

export const getGame = () => game
export const getState = () => state

export type ActionResponse = {
    success: boolean
    error?: string
    message?: string
}

export const startGame = (options: ShanghaiOptions) => {
    game = options
    state = initialState(game.players)
}

//#region game logic
export const handleAction = (action: Action): ActionResponse => {
    if (!some(game.players, n => n === action.playerName)) {
        return {
            success: false,
            error: `Player ${action.playerName} is not in the game`
        }
    }

    if (action.setReady) {
        const player = getPlayerByName(action.playerName)
        player.isReady = true
        checkGameContinue()
        return {
            success: true
        }
    }

    if (!state.roundIsOn) {
        return {
            success: false,
            error: "Round hasn't started"
        }
    }

    const isPlayersTurn = action.playerName === getCurrentPlayer().name

    if (!isPlayersTurn) {
        return foreignPlayerAction(action)
    }

    return currentPlayerAction(action)
}

const foreignPlayerAction = (action: Action): ActionResponse => {
    if (action.shanghai) {
        return actionCallShanghai(action.playerName)
    }
    return {
        success: false,
        error: "It is not your turn"
    }
}

const currentPlayerAction = (action: Action): ActionResponse => {
    if (state.shanghaiFor) {
        return currentPlayerShanghaiAction(action)
    } else if (action.allowShanghai) {
        return {
            success: false,
            error: "No one has called Shanghai"
        }
    }

    if (action.shanghai) {
        return {
            success: false,
            error: "You cannot call Shanghai on your turn"
        }
    }

    if (action.revealDeck) {
        return actionRevealDeck()
    }

    const player = getCurrentPlayer()

    if (action.takeDiscard) {
        return actionTakeDiscard(player)
    }
    if (action.takeDeck) {
        return actionTakeDeck(player)
    }
    if (action.meld) {
        return actionMeld(player, action.meld)
    }
    if (action.discard) {
        return actionDiscard(player, action.discard)
    }
    if (action.addToMeld) {
        return actionAddToMeld(player, action.addToMeld)
    }

    return {
        success: false,
        error: "No valid action provided"
    }
}

// Current player when there is an active Shanghai call
const currentPlayerShanghaiAction = (action: Action): ActionResponse => {
    if (action.allowShanghai) {
        return actionAllowShanghaiCall()
    }
    if (action.takeDiscard) {
        return actionTakeDiscard(getCurrentPlayer())
    }
    return {
        success: false,
        error: "You must either allow the Shanghai call or take a card from the discard pile"
    }
}

//#region  individual actions
const actionCallShanghai = (playerName: string): ActionResponse => {
    const player = getPlayerByName(playerName)
    if (!state.shanghaiIsAllowed) {
        return {
            success: false,
            error: "Calling Shanghai is not allowed currently"
        }
    }
    if (state.discarded.length === 0) {
        return {
            success: false,
            error: "There are no cards in the discard pile"
        }
    }

    if (player.melded.length) {
        return {
            success: false,
            error: "You cannot call Shanghai after melding"
        }
    }
    if (player.shanghaiCount >= game.shanghaiCount) {
        return {
            success: false,
            error: "You have already called Shanghai maximum amount of times"
        }
    }

    if (!state.shanghaiFor) {
        state.shanghaiFor = player.name
        return {
            success: true,
        }
    }

    return {
        success: false,
        error: `Shanghai was already called by ${state.shanghaiFor}`
    }
}

const actionAllowShanghaiCall = (): ActionResponse => {
    if (!state.shanghaiFor) {
        return {
            success: false,
            error: "No one has called Shanghai"
        }
    }

    const discard = state.discarded.pop()

    if (!discard) {
        return {
            success: false,
            error: "Discard pile was empty when allowing Shanghai call"
        }
    }

    const penalty = popDeck()

    const player = getPlayerByName(state.shanghaiFor)

    giveCard(player, discard)
    giveCard(player, penalty)

    return {
        success: true,
        message: `Succesfully called Shanghai for ${cardToString(discard)} and received ${cardToString(penalty)} as penalty`
    }
}

const actionRevealDeck = (): ActionResponse => {
    if (state.discarded.length > 0 && state.deck.length > 0) {
        return {
            success: false,
            error: "Can't reveal a card if the discard pile has cards"
        }
    }

    const card = popDeck()
    state.discarded.push(card)

    return {
        success: true,
        message: `Revealed ${cardToString(card)}`
    }
}

const actionTakeDiscard = (player: Player): ActionResponse => {
    const card = state.discarded.pop()

    if (!card) {
        return {
            success: false,
            error: "Can't take card from empty discard pile"
        }
    }

    giveCard(player, card)

    return {
        success: true,
        message: `Picked up ${cardToString(card)}`
    }
}

const actionTakeDeck = (player: Player): ActionResponse => {
    const card = popDeck()
    giveCard(player, card)
    return {
        success: true,
        message: `Picked up ${cardToString(card)}`
    }
}

const actionMeld = (player: Player, meld: MeldAction): ActionResponse => {
    if (player.melded.length) {
        return {
            success: false,
            error: "You have already melded your cards"
        }
    }
    if (!areMeldsValid(player, meld)) {
        return {
            success: false,
            error: "Invalid meld"
        }
    }

    const newMeld: MeldedMeld[] = []
    const round = game.rounds[state.roundNumber]
    for (let i = 0; i < round.melds.length; i++) {
        // take and remove cards
        const cards = getPlayerCards(player, meld.melds[i].cardIDs, true)
        newMeld.push({ cards })
    }
    player.melded = newMeld

    return {
        success: true,
        message: "Succesfully melded cards"
    }
}

const actionDiscard = (player: Player, toDiscard: Card): ActionResponse => {
    const hasCard = player.cards.some(c => c.id === toDiscard.id)
    if (!hasCard) {
        return {
            success: false,
            error: "You do not have this card in hand"
        }
    }

    player.cards = player.cards.filter(c => c.id !== toDiscard.id)
    state.discarded.push(toDiscard)

    endPlayerTurn(player)

    return {
        success: true,
        message: `Discarded ${cardToString(toDiscard)}`
    }
}

const actionAddToMeld = (player: Player, meld: AddToMeldAction): ActionResponse => {
    const newMeldCards = isValidAddMeld(player, meld)
    if (!newMeldCards) {
        return {
            success: false,
            error: "Invalid meld action"
        }
    }

    // remove card from player
    getPlayerCards(player, [meld.cardToMeldId], true)

    // save target meld
    getPlayerByName(meld.targetPlayer).melded[meld.targetMeldIndex] = { cards: newMeldCards }

    if (player.cards.length === 0) {
        endPlayerTurn(player)
    }

    return {
        success: true,
    }
}

//#endregion
// Returns the new meld cards if they are valid, undefined otherwise
const isValidAddMeld = (player: Player, meld: AddToMeldAction): Card[] | undefined => {
    // Check if player has card
    const cardToMeld = find(player.cards, card => card.id == meld.cardToMeldId)
    if (!cardToMeld) {
        return undefined
    }

    const targetPlayer = getPlayerByName(meld.targetPlayer)

    if (!targetPlayer.melded.length) {
        return undefined
    }

    const round = game.rounds[state.roundNumber]
    const targetMeld = round.melds[meld.targetMeldIndex]
    let targetMeldCards = targetPlayer.melded[meld.targetMeldIndex].cards
    targetMeldCards = targetMeldCards.splice(meld.targetMeldInsertIndex, 0, cardToMeld)

    if (!isMeldValid(targetMeld, targetMeldCards)) {
        return undefined
    }

    return targetMeldCards
}


// NOTE!!! REQUIREMENTS FOR ALL STRAIGHTS MUST HAVE EQUAL LENGTH AND ALL SETS MUST BE OF EQUAL SIZE
const areMeldsValid = (player: Player, playerMelds: MeldAction) => {
    if (checkDuplicateMeldCards(playerMelds)) {
        return false
    }

    const round = game.rounds[state.roundNumber]

    if (playerMelds.melds.length !== round.melds.length) {
        return false
    }

    for (let i = 0; i < round.melds.length; i++) {
        const meld = round.melds[i]
        const playerMeld = playerMelds.melds[i]
        if (!isPlayerMeldValid(player, meld, playerMeld)) {
            return false
        }
    }

    throw "Not yet implemented"
}

const checkDuplicateMeldCards = (melds: MeldAction) => {
    const cardIDs = flatMap(melds.melds, m => m.cardIDs)
    return cardIDs.length === uniq(cardIDs).length
}

const isPlayerMeldValid = (player: Player, meld: Meld, playerMeld: MeldCards) => {
    const cards = getPlayerCards(player, playerMeld.cardIDs, false)

    // Tried to meld cards we don't have
    if (cards.length !== playerMeld.cardIDs.length) {
        return false
    }

    return isMeldValid(meld, cards)
}

const isMeldValid = (meld: Meld, cards: Card[]) => {
    if (meld.type === "set") {
        return checkSetValidity(cards, meld.length)
    }
    if (meld.type === "straight") {
        return checkStraightValidity(cards, meld.length)
    }
}

// Input is ordered by meld order
const checkSetValidity = (cards: Card[], size: number) => {
    const refCard = minBy(cards, c => c.rank)

    // No cards
    if (!refCard) {
        return false
    }

    // All jokers
    if (refCard.rank === 25 && cards.length >= size) {
        return true
    }

    // Many different ranks
    if (cards.some(card => card.rank !== 25 && card.rank !== refCard.rank)) {
        return false
    }

    return cards.length >= size
}

// Input is ordered by meld order
const checkStraightValidity = (cards: Card[], length: number) => {
    const refCard = minBy(cards, c => c.rank)

    // No cards
    if (!refCard) {
        return false
    }

    // All jokers
    if (refCard.rank === 25 && cards.length >= length) {
        return true
    }

    const ordered = orderBy(cards, c => c.id)

    let expectedRank: CRank | undefined = refCard.rank
    for (let card of ordered) {
        // Straight did not end at an Ace
        if (!expectedRank) {
            return false
        }
        // Card is not joker and card is not the next expected rank
        // or suit is wrong
        if (card.rank !== 25 && card.rank !== expectedRank && card.suit !== refCard.suit) {
            return false
        }
        expectedRank = nextRank(expectedRank)
    }
}

const endPlayerTurn = (player: Player) => {
    if (player.cards.length === 0) {
        state.roundIsOn = false
        addPlayerPoints()
        unreadyPlayers()

        /// last round just ended
        if (state.roundNumber === game.rounds.length - 1) {
            const winner = minBy(state.players, p => p.points)
            state.winner = winner ? winner.name : "No winner"
            return
        }
    }

    state.turn++
}

const addPlayerPoints = () => {
    state.players.forEach(player => {
        player.cards.forEach(card => {
            player.points += card.rank
        })
    })
}

const unreadyPlayers = () => {
    state.players.forEach(player => player.isReady = false)
}

const checkGameContinue = () => {
    if (state.roundIsOn) {
        return
    }
    if (some(state.players, p => !p.isReady)) {
        return
    }

    // all ready
    state.roundNumber++
    initializeRound()
}

const initializeRound = () => {
    state.roundIsOn = true
    const round = game.rounds[state.roundNumber]

    state.players.forEach(resetPlayer)

    state.deck = shuffle(createDeck(game.deckCount, game.jokerCount))

    // deal
    for (let p = 0; p < state.players.length; p++) {
        const player = state.players[p]
        for (let i = 0; i < round.cardCount; i++) {
            giveCard(player, popDeck())
        }
    }
}

const resetPlayer = (player: Player) => {
    player.cards = []
    player.shanghaiCount = 0
    player.melded = []
}
//#endregion

const getCurrentPlayer = () => state.players[getPlayerTurn(state.turn)]

const getPlayerByName = (name: string) => state.players.filter(p => p.name === name)[0]

const getPlayerTurn = (turnIndex: number) => turnIndex % state.players.length

const getPlayerCards = (player: Player, cardIDs: number[], removeCards: boolean) => {
    const cardsToTake = compact(cardIDs.map(id => find(player.cards, c => c.id === id)))

    if (removeCards) {
        player.cards = remove(player.cards, card => some(cardsToTake, toTake => toTake.id === card.id))
    }

    return cardsToTake
}
const popDeck = (): Card => {
    if (state.deck.length === 0) {
        state.deck = shuffle(state.discarded)
        state.discarded = []
    }

    const card = state.deck[0]
    state.deck = state.deck.slice(1)
    return card
}

const giveCard = (player: Player, card: Card) => {
    player.cards.push(card)
    player.cards = orderBy(player.cards, c => c.id)
}

const shuffle = (cards: Card[]): Card[] => {
    const array = [...cards]
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

const initialState = (players: string[]): ShanghaiState => {
    return {
        players: players.map(createPlayer),
        roundIsOn: false,
        roundNumber: -1,
        turn: 0,
        shanghaiIsAllowed: false,
        shanghaiFor: null,
        deck: createDeck(game.deckCount, game.jokerCount),
        discarded: [],
    }
}


const createDeck = (deckCount: number, jokerCount: number) => {
    let cardId = 1
    const cards: Card[] = []
    for (let deck = 0; deck < deckCount; deck++) {
        for (let suit = 0; suit < 4; suit++) {
            for (let rank = 2; rank <= 14; rank++) {
                cards.push({
                    id: cardId++,
                    suit: suitFromNumber(suit),
                    rank: rank as CRank
                })
            }
        }
    }
    for (let i = 0; i < jokerCount; i++) {
        cards.push({
            id: cardId++,
            suit: suitFromNumber(i),
            rank: 25
        })
    }

    return cards
}

const suitFromNumber = (n: number): CSuit => {
    const v = n % 4
    switch (v) {
        case 0:
            return "heart"
        case 1:
            return "spade"
        case 2:
            return "diamond"
        default:
            return "club"
    }
}

const createPlayer = (name: string): Player => ({
    name,
    isReady: false,
    points: 0,
    cards: [],
    melded: [],
    shanghaiCount: 0,
})

const cardToString = (card: Card) => `${rankToString(card.rank)} of ${card.suit}s`

const rankToString = (rank: CRank) => {
    switch (rank) {
        case 11:
            return "Jack"
        case 12:
            return "Queen"
        case 13:
            return "King"
        case 14:
            return "Ace"
        case 25:
            return "Joker"
        default:
            return `${rank}`
    }
}

const nextRank = (rank: CRank) => {
    let rankAdd = rank + 1
    if (rank > 14) {
        return undefined
    }
    return rankAdd as CRank
}
