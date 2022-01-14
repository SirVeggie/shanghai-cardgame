import { compact, filter, find, flatMap, map, minBy, orderBy, remove, some, uniq, uniqBy } from 'lodash'
import { ShanghaiGame, Action, ShanghaiOptions, ShanghaiState, AddToMeldAction, Card, CRank, CSuit, Meld, MeldAction, MeldCards, MeldedMeld, Player, ActionResponse, cardToString, nextRank, suitFromNumber, getCurrentPlayer, getPlayerByName } from '../../frontend/src/shared'
import arrayShuffle from 'shuffle-array'

// NOTE ACE IS NOT 1

let options: ShanghaiOptions
let state: ShanghaiState

export const getGame = () => options
export const getState = () => state

export const startGame = (game: ShanghaiGame) => {
    options = game.options
    state = game.state ? game.state : initialState(options.players)
}

//#region game logic
export const handleAction = (action: Action): ActionResponse => {
    console.log('Action')
    console.log(JSON.stringify(action, null, 2))
    if (!some(options.players, n => n === action.playerName)) {
        return {
            success: false,
            error: `Player ${action.playerName} is not in the game`
        }
    }

    if (action.setReady) {
        const player = getPlayerByName(state, action.playerName)
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

    const isPlayersTurn = action.playerName === getCurrentPlayer(state).name

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

    const player = getCurrentPlayer(state)

    if (action.revealDeck) {
        return actionRevealDeck(player)
    }
    if (action.takeDiscard) {
        return actionTakeDiscard(player)
    }
    if (action.takeDeck) {
        return actionTakeDeck(player)
    }
    if (action.meld) {
        return actionMeld(player, action.meld)
    }
    if (action.discardID) {
        return actionDiscard(player, action.discardID)
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
        return actionTakeDiscard(getCurrentPlayer(state))
    }
    return {
        success: false,
        error: "You must either allow the Shanghai call or take a card from the discard pile"
    }
}

//#region  individual actions
const actionCallShanghai = (playerName: string): ActionResponse => {
    const player = getPlayerByName(state, playerName)
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
    if (player.shanghaiCount >= options.shanghaiCount) {
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

    const player = getPlayerByName(state, state.shanghaiFor)

    giveCard(player, discard)
    giveCard(player, penalty)

    state.shanghaiIsAllowed = false

    return {
        success: true,
        message: `Succesfully called Shanghai for ${cardToString(discard)} and received ${cardToString(penalty)} as penalty`
    }
}

const actionRevealDeck = (player: Player): ActionResponse => {
    if (!playerCanTakeCard(player)) {
        return {
            success: false,
            error: 'You can only take 1 card per turn'
        }
    }

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
    if (!playerCanTakeCard(player)) {
        return {
            success: false,
            error: 'You can only take 1 card per turn'
        }
    }

    const card = state.discarded.pop()

    if (!card) {
        return {
            success: false,
            error: "Can't take card from empty discard pile"
        }
    }

    giveCard(player, card)
    player.canTakeCard = false

    state.shanghaiIsAllowed = false
    return {
        success: true,
        message: `Picked up ${cardToString(card)}`
    }
}

const actionTakeDeck = (player: Player): ActionResponse => {
    if (!playerCanTakeCard(player)) {
        return {
            success: false,
            error: 'You can only take 1 card per turn'
        }
    }

    const card = popDeck()
    giveCard(player, card)
    player.canTakeCard = false

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
    const check = areMeldsValid(player, meld)
    if (!check.success) {
        return check
    }

    const newMeld: MeldedMeld[] = []
    const round = options.rounds[state.roundNumber]
    for (let i = 0; i < round.melds.length; i++) {
        // take and remove cards
        const cards = getPlayerCards(player, meld.melds[i].cardIDs, true)
        newMeld.push({ cards })
    }
    player.melded = newMeld

    if (player.cards.length === 0) {
        endPlayerTurn(player)
    }

    return {
        success: true,
        message: "Succesfully melded cards"
    }
}

const actionDiscard = (player: Player, toDiscardId: number): ActionResponse => {
    if (!playerCanDiscard(player)) {
        return {
            success: false,
            error: 'You must take a card before discarding'
        }
    }

    const cardToDiscard = player.cards.find(c => c.id === toDiscardId)
    if (!cardToDiscard) {
        return {
            success: false,
            error: "You do not have this card in hand"
        }
    }

    player.cards = player.cards.filter(c => c.id !== toDiscardId)
    state.discarded.push(cardToDiscard)

    endPlayerTurn(player)

    state.shanghaiIsAllowed = true
    return {
        success: true,
        message: `Discarded ${cardToString(cardToDiscard)}`
    }
}

const actionAddToMeld = (player: Player, meld: AddToMeldAction): ActionResponse => {
    const newMeldCards = isValidAddMeld(player, meld)
    if (!newMeldCards.response.success) {
        return newMeldCards.response
    }
    if (!newMeldCards.cards) {
        return {
            success: false,
            error: 'Unknown actionAddToMeld error'
        }
    }

    // remove card from player
    getPlayerCards(player, [meld.cardToMeldId], true)

    // save target meld
    getPlayerByName(state, meld.targetPlayer).melded[meld.targetMeldIndex] = { cards: newMeldCards.cards }

    if (player.cards.length === 0) {
        endPlayerTurn(player)
    }

    return {
        success: true,
    }
}

//#endregion
// Returns the new meld cards if they are valid, undefined otherwise
const isValidAddMeld = (player: Player, meld: AddToMeldAction): MeldAddResponse => {
    // Check if player has card
    const cardToMeld = find(player.cards, card => card.id == meld.cardToMeldId)
    if (!cardToMeld) {
        return {
            response: {
                success: false,
                error: 'You do not have this card'
            }
        }
    }

    const targetPlayer = getPlayerByName(state, meld.targetPlayer)

    if (!targetPlayer.melded.length) {
        return {
            response: {
                success: false,
                error: 'Target player has not melded yet'
            }
        }
    }

    // todo joker replace
    if (meld.targetMeldInsertIndex === undefined) {
        return {
            response: {
                success: false,
                error: 'Replacing joker in a meld is not yet possible'
            }
        }
    }

    const round = options.rounds[state.roundNumber]
    const targetMeld = round.melds[meld.targetMeldIndex]
    const targetMeldCards = [...targetPlayer.melded[meld.targetMeldIndex].cards]
    console.log("first: ", { targetMeldCards })
    targetMeldCards.splice(meld.targetMeldInsertIndex, 0, cardToMeld)

    console.log({
        round, targetMeld, targetMeldCards
    })

    if (!isMeldValid(targetMeld, targetMeldCards)) {
        return {
            response: {
                success: false,
                error: 'Invalid card or position in a meld'
            }
        }
    }

    return {
        response: {
            success: true
        },
        cards: targetMeldCards
    }
}
type MeldAddResponse = {
    response: ActionResponse
    cards?: Card[]
}


// NOTE!!! REQUIREMENTS FOR ALL STRAIGHTS MUST HAVE EQUAL LENGTH AND ALL SETS MUST BE OF EQUAL SIZE
const areMeldsValid = (player: Player, playerMelds: MeldAction): ActionResponse => {
    if (hasDuplicateMeldCards(playerMelds)) {
        console.log("duplicate meld cards")
        return {
            success: false,
            error: 'You tried to meld duplicate cards'
        }
    }

    const round = options.rounds[state.roundNumber]

    if (playerMelds.melds.length !== round.melds.length) {
        console.log("Invalid meld array count")
        return {
            success: false,
            error: 'Invalid amount of melds'
        }
    }

    for (let i = 0; i < round.melds.length; i++) {
        const meld = round.melds[i]
        const playerMeld = playerMelds.melds[i]
        if (!isPlayerMeldValid(player, meld, playerMeld)) {
            return {
                success: false,
                error: 'Invalid meld'
            }
        }
    }

    return {
        success: true
    }
}

const hasDuplicateMeldCards = (melds: MeldAction) => {
    const cardIDs = flatMap(melds.melds, m => m.cardIDs)
    return cardIDs.length !== uniq(cardIDs).length
}

const isPlayerMeldValid = (player: Player, meld: Meld, playerMeld: MeldCards) => {
    const cards = getPlayerCards(player, playerMeld.cardIDs, false)

    // Tried to meld cards we don't have
    if (cards.length !== playerMeld.cardIDs.length) {
        console.log("melding unavailable cards")
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
    throw "Invalid meld type"
}

// Input is ordered by meld order
const checkSetValidity = (cards: Card[], size: number) => {
    const refCard = minBy(cards, c => c.rank)

    // No cards
    if (!refCard) {
        console.log('Set error: no cards')
        return false
    }

    // All jokers
    if (refCard.rank === 25 && cards.length >= size) {
        console.log('Set success: all jokers')
        return true
    }

    // Many different ranks
    if (cards.some(card => card.rank !== 25 && card.rank !== refCard.rank)) {
        console.log('Set error: many different ranks')
        return false
    }

    console.log(`return ${cards.length} >= ${size}`)
    return cards.length >= size
}

// Input is ordered by meld order
const checkStraightValidity = (cards: Card[], length: number) => {
    const refCard = minBy(cards, c => c.rank)

    // No cards
    if (!refCard) {
        console.log("no cards")
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
            console.log("unexpected rank")
            return false
        }
        // Card is not joker and card is not the next expected rank
        // or suit is wrong
        if (card.rank !== 25 && card.rank !== expectedRank && card.suit !== refCard.suit) {
            console.log("unexpected suit")
            return false
        }
        expectedRank = nextRank(expectedRank)
    }

    return ordered.length >= length
}

const playerCanTakeCard = (player: Player) => {
    return player.canTakeCard
}

const playerCanDiscard = (player: Player) => {
    return !player.canTakeCard
}

const getPlayerTargetCardCount = (player: Player) => {
    return options.rounds[state.roundNumber].cardCount + player.shanghaiCount * 2
}

const endPlayerTurn = (player: Player) => {
    if (player.cards.length === 0 || state.deck.length === 0) {
        state.roundIsOn = false
        addPlayerPoints()
        unreadyPlayers()

        /// last round just ended
        if (state.roundNumber === options.rounds.length - 1) {
            const winner = minBy(state.players, p => p.points)
            state.winner = winner ? winner.name : "No winner"
            return
        }
    }

    state.turn++
    enablePlayerTurn()
}

const enablePlayerTurn = () => {
    state.players.forEach(p => p.canTakeCard = false)
    const player = getCurrentPlayer(state)
    player.canTakeCard = true
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
    const round = options.rounds[state.roundNumber]

    state.players.forEach(resetPlayer)

    state.deck = shuffle(createDeck(options.deckCount, options.jokerCount))

    // deal
    for (let p = 0; p < state.players.length; p++) {
        const player = state.players[p]
        for (let i = 0; i < round.cardCount; i++) {
            giveCard(player, popDeck())
        }
    }

    state.turn = state.roundNumber % state.players.length
    enablePlayerTurn()
}

const resetPlayer = (player: Player) => {
    player.cards = []
    player.shanghaiCount = 0
    player.melded = []
    player.canTakeCard = false
}
//#endregion
const getPlayerCards = (player: Player, cardIDs: number[], removeCards: boolean) => {
    const cardsToTake = compact(cardIDs.map(id => find(player.cards, c => c.id === id)))

    if (removeCards) {
        console.log("removing cards...", { player, cardsToTake })
        player.cards = filter(player.cards, card => !cardsToTake.includes(card))
        console.log(player)
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
    return arrayShuffle(cards)
}

const initialState = (players: string[]): ShanghaiState => {
    return {
        players: players.map(createPlayer),
        roundIsOn: false,
        roundNumber: -1,
        turn: 0,
        shanghaiIsAllowed: false,
        shanghaiFor: null,
        deck: createDeck(options.deckCount, options.jokerCount),
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

const createPlayer = (name: string): Player => ({
    name,
    isReady: false,
    points: 0,
    cards: [],
    melded: [],
    shanghaiCount: 0,
    canTakeCard: false
})

