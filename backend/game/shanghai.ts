import { compact, filter, find, findIndex, flatMap, map, minBy, orderBy, remove, some, uniq, uniqBy } from 'lodash'
import { ShanghaiGame, Action, ShanghaiOptions, ShanghaiState, AddToMeldAction, Card, CRank, CSuit, Meld, MeldAction, MeldCards, MeldedMeld, Player, ActionResponse, cardToString, nextRank, suitFromNumber, getCurrentPlayer, getPlayerByName, CJokerRank } from '../../frontend/src/shared'
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
        if (action.addToMeld.replaceJoker) {
            return actionAddToMeldReplaceJoker(player, action.addToMeld)
        }
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
    if (player.name === state.discardTopOwner) {
        return {
            success: false,
            error: 'You cannot call Shanghai on your own discard card'
        }
    }

    if (!state.shanghaiFor) {
        state.shanghaiFor = player.name
        message(`${player.name} called Shanghai!`)
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

    const current = getCurrentPlayer(state)
    const player = getPlayerByName(state, state.shanghaiFor)

    giveCard(player, discard)
    giveCard(player, penalty)

    state.shanghaiIsAllowed = false
    state.discardTopOwner = undefined
    state.shanghaiFor = null
    player.shanghaiCount++

    message(`${current.name} allowed the Shanghai call for ${player.name} with card: ${cardToString(discard)}`)
    return {
        success: true,
        message: `Succesfully allowed Shanghai for ${cardToString(discard)}`
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
    state.shanghaiIsAllowed = true
    state.discardTopOwner = undefined

    message(`${player.name} revealed ${cardToString(card)}`)
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
    state.shanghaiFor = null
    state.discardTopOwner = undefined

    message(`${player.name} picked up ${cardToString(card)} from the discard pile`)
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
    state.shanghaiIsAllowed = false

    message(`${player.name} picked up a card from the deck`)
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

    message(`${player.name} melded cards`)
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

    if (player.cards.some(card => card.mustBeMelded)) {
        return {
            success: false,
            error: 'You must meld the Joker cards in your hand'
        }
    }

    player.cards = player.cards.filter(c => c.id !== toDiscardId)
    state.discarded.push(cardToDiscard)
    state.discardTopOwner = player.name

    endPlayerTurn(player)

    state.shanghaiIsAllowed = true

    message(`${player.name} discarded ${cardToString(cardToDiscard)}`)
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
    const [meldedCard] = getPlayerCards(player, [meld.cardToMeldId], true)

    // save target meld
    getPlayerByName(state, meld.targetPlayer).melded[meld.targetMeldIndex] = { cards: newMeldCards.cards }

    if (player.cards.length === 0) {
        endPlayerTurn(player)
    }

    message(`${player.name} melded ${cardToString(meldedCard)} into ${meld.targetPlayer}'s table`)
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

    const round = options.rounds[state.roundNumber]
    const targetMeld = round.melds[meld.targetMeldIndex]
    const targetMeldCards = [...targetPlayer.melded[meld.targetMeldIndex].cards]

    const insertIndex = meld.insertBehind ? targetMeldCards.length : 0

    console.log("first: ", { targetMeldCards })
    targetMeldCards.splice(insertIndex, 0, cardToMeld)

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

const actionAddToMeldReplaceJoker = (player: Player, meld: AddToMeldAction): ActionResponse => {
    // Check if player has card
    const cardToMeld = find(player.cards, card => card.id == meld.cardToMeldId)
    if (!cardToMeld) {
        return {
            success: false,
            error: 'You do not have this card'
        }
    }

    const targetPlayer = getPlayerByName(state, meld.targetPlayer)

    if (!targetPlayer.melded.length) {
        return {
            success: false,
            error: 'Target player has not melded yet'
        }
    }

    const targetMeld = options.rounds[state.roundNumber].melds[meld.targetMeldIndex]

    if (targetMeld.type !== 'straight') {
        return {
            success: false,
            error: 'Cannot replace Joker from a set'
        }
    }

    const targetMeldCards = targetPlayer.melded[meld.targetMeldIndex].cards
    const jokers = getStraightJokersFromValidStraight(targetMeldCards)

    const matchingJoker = jokers.find(joker => joker.rank === cardToMeld.rank)

    if (!matchingJoker) {
        return {
            success: false,
            error: 'You cannot replace any jokers with this card'
        }
    }


    const newCards = [...targetMeldCards]

    // Remove card to meld
    getPlayerCards(player, [cardToMeld.id], true)

    // replace joker
    newCards[matchingJoker.index] = cardToMeld

    // save new meld
    targetPlayer.melded[meld.targetMeldIndex] = { cards: newCards }

    // Give new joker
    giveCard(player, { ...matchingJoker.joker, mustBeMelded: true })

    message(`${player.name} replaced the Joker from ${meld.targetPlayer}'s table with card ${cardToString(cardToMeld)}`)
    return {
        success: true,
        message: 'Succesfully replaced Joker'
    }
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
    if (cards.length < size) {
        return false
    }

    const refCard = minBy(cards, c => c.rank)

    // No cards
    if (!refCard) {
        console.log('Set error: no cards')
        return false
    }

    // All jokers
    if (refCard.rank === 25) {
        console.log('Set success: all jokers')
        return true
    }

    // Many different ranks
    if (cards.some(card => card.rank !== 25 && card.rank !== refCard.rank)) {
        console.log('Set error: many different ranks')
        return false
    }

    console.log(`return ${cards.length} >= ${size}`)
    return true
}

// Input is ordered by meld order
const checkStraightValidity = (cards: Card[], length: number) => {
    if (cards.length < length) {
        return false
    }

    const refCard = minBy(cards, c => c.rank)

    // No cards
    if (!refCard) {
        console.log("no cards")
        return false
    }

    // All jokers (if minimum rank is joker)
    if (refCard.rank === 25) {
        return true
    }

    // not same suit (card is not joker and different suit)
    if (cards.some(card => card.rank !== 25 && card.suit !== refCard.suit)) {
        return false
    }

    const firstRank = getFirstExpectedRank(cards)

    // straight starts from below ace
    if (firstRank === undefined) {
        return false
    }

    let expectedRank: CRank | undefined

    if (firstRank === 14) {
        expectedRank = 2
    } else {
        expectedRank = nextRank(firstRank)
    }

    for (let i = 1; i < cards.length; i++) {

        // straight cannot continue after ace
        if (!expectedRank) {
            return false
        }

        const rank = cards[i].rank

        // not joker and not expected rank
        if (rank !== 25 && rank !== expectedRank) {
            return false
        }

        expectedRank = nextRank(expectedRank)
    }

    return true
}

const getFirstExpectedRank = (cards: Card[]): CJokerRank | undefined => {
    let firstRank = cards[0].rank

    // starts with joker
    if (firstRank === 25) {
        const firstNonJokerIndex = findIndex(cards, card => card.rank !== 25)
        const firstNonJokerRank = cards[firstNonJokerIndex].rank
        // first card is first non joker - firstJokerCount
        const firstRankValue = firstNonJokerRank - firstNonJokerIndex

        // straight starts from below ace
        if (firstRankValue < 1) {
            return undefined
        }
        // straight starts from ace
        if (firstRankValue === 1) {
            firstRank = 14
        } else {
            firstRank = firstRankValue as CJokerRank
        }
    }

    return firstRank
}

const getStraightJokersFromValidStraight = (cards: Card[]): JokerWithRank[] => {
    const jokers: JokerWithRank[] = []

    let expectedRank = getFirstExpectedRank(cards)

    // melded straights should be valid
    if (!expectedRank) {
        throw "Melded straight was invalid check 1"
    }


    for (let i = 0; i < cards.length; i++) {
        const card = cards[i]

        if (!expectedRank) {
            throw "Melded straight was invalid check 2"
        }

        if (card.rank === 25) {
            jokers.push({
                joker: card,
                index: i,
                rank: expectedRank
            })
        }

        expectedRank = nextRank(expectedRank)
    }

    return jokers
}

type JokerWithRank = {
    joker: Card,
    index: number,
    rank: CJokerRank
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
        state.discarded = []
        state.shanghaiFor = null
        state.message = 'Round ended'
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

const message = (msg: string) => state.message = msg

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
    for (let suit = 0; suit < 4; suit++) {
        for (let rank = 2; rank <= 14; rank++) {
            for (let deck = 0; deck < deckCount; deck++) {
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

