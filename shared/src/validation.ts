import { Card, GameConfig, GameJoinParams, JOKER_RANK, Meld, MeldConfig, MELD_TYPES, SessionPublic } from './types';
import { countBy, flatMap, takeRightWhile, takeWhile, uniqBy } from 'lodash';
import { assertNever, userError, GameAction, DataAction, getPrevPlayer } from '.';

export function isNumber(a: unknown): a is number {
    return typeof a === 'number';
}

export function isString(a: unknown): a is string {
    return typeof a === 'string';
}

export function val(validator: (a: unknown) => boolean, a: unknown, error: string) {
    if (!validator(a))
        throw userError(error);
}

export function validateJoinParams(params: GameJoinParams) {
    if (!params)
        throw userError('Missing join params');
    val(isString, params.playerName, 'Missing player name');
    val(isString, params.lobbyName, 'Missing game name');
    val(isString, params.password, 'Missing password');
    validateConfig(params.config);
}

export function validateConfig(config: GameConfig | undefined): void {
    if (!config)
        return;
    val(isNumber, config.minimumCardPoints, 'Invalid minimum card points');
    val(isNumber, config.firstMeldBonusPoints, 'Invalid first meld bonus points');
    val(isNumber, config.meldBonusStartPoints, 'Invalid meld bonus start points');
    val(isNumber, config.meldBonusIncrementPoints, 'Invalid meld bonus increment points');
    val(isNumber, config.jokerPenaltyAmountMeld, 'Invalid joker penalty amount meld');
    val(isNumber, config.jokerPenaltyAmountHand, 'Invalid joker penalty amount hand');

    if (!config.rounds)
        throw userError('missing round config');
    config.rounds.forEach(round => {
        val(isString, round.description, 'Invalid description');
        val(isNumber, round.cardCount, 'Invalid card count');
        val(isNumber, round.deckCount, 'Invalid deck count');
        val(isNumber, round.jokerCount, 'Invalid joker count');
        val(isNumber, round.shanghaiCount, 'Invalid shanghai count');
        val(isNumber, round.shanghaiPenaltyCount, 'Invalid shanghai penalty count');

        if (!round.melds)
            throw userError('missing round meld config');
        round.melds.forEach(meld => {
            val(isNumber, meld.length, 'Invalid meld length');
            if (!MELD_TYPES.some(x => x === meld.type))
                throw userError('Invalid meld type');
        });
    });
}

export function validateMelds(melds: Meld[], configs: MeldConfig[]): boolean {
    if (melds.length !== configs.length)
        return false;
    const allCards = flatMap(melds, x => x.cards);
    if (uniqBy(allCards, x => x.id).length !== allCards.length)
        return false;

    // force smaller melds and configs to be checked first
    melds = [...melds].sort((a, b) => a.cards.length - b.cards.length);
    const configsCopy = [...configs].sort((a, b) => a.length - b.length);

    for (let i = 0; i < melds.length; i++) {
        const index = configsCopy.findIndex(config => validateMeld(melds[i].cards, config));
        if (index === -1)
            return false;
        melds[i].config = configsCopy.splice(index, 1)[0];
    }

    return true;
}

export function validateMeld(meld: Card[], config: MeldConfig): boolean {
    switch (config.type) {
        case 'set': return validateSet(meld, config.length);
        case 'straight': return validateStraight(meld, config.length);
        case 'any-straight': return validateAnyStraight(meld, config.length);
        case 'skip-straight': return validateSkipStraight(meld, config.length);
        case 'house': return validateHouse(meld, config.length);

        default: return assertNever(config.type);
    }
}

export function isJoker(card: Card): boolean {
    return card.rank === JOKER_RANK;
}

export function findJokerSpot(card: Card, meld: Meld): number {
    // banned meld types
    if (isJoker(card))
        return -1;
    if (['set'].some(x => x === meld.config.type))
        return -1;

    const jokerIndexes = meld.cards.reduce((list, x, i) => isJoker(x) ? [...list, i] : list, [] as number[]);
    for (const i of jokerIndexes) {
        const cards = [...meld.cards];
        cards[i] = card;
        if (validateMeld(cards, meld.config))
            return i;
    }

    return -1;
}

function validateSet(cards: Card[], length: number): boolean {
    if (!cards?.length)
        return false;
    if (cards.length < length)
        return false;

    const rank = cards.find(x => !isJoker(x))?.rank ?? 0;
    if (cards.some(x => x.rank !== rank && !isJoker(x)))
        return false;
    return true;
}

function validateStraight(cards: Card[], length: number): boolean {
    if (!cards?.length)
        return false;
    if (cards.length < length)
        return false;


    const normals = cards.filter(x => !isJoker(x));
    const suit = normals[0]?.suit ?? 0;
    const first = cards[0]?.rank === 14 ? 1 : normals[0]?.rank ?? 1;
    const last = normals[normals.length - 1]?.rank ?? 1;
    
    if (normals.some(x => x.suit !== suit))
        return false;
    if (takeWhile(cards, x => isJoker(x)).length >= first)
        return false;
    if (takeRightWhile(cards, x => isJoker(x)).length + last > 14)
        return false;

    let expected = first;
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        if (expected === first && isJoker(card)) {
            continue;

        } else if (expected === 1 && card.rank === 14) {
            expected++;

        } else if (card.rank !== expected && !isJoker(card)) {
            return false;

        } else {
            expected++;
        }
    }

    return true;
}

function validateAnyStraight(cards: Card[], length: number): boolean {
    if (!cards?.length)
        return false;
    if (cards.length < length)
        return false;


    const normals = cards.filter(x => !isJoker(x));
    const first = cards[0]?.rank === 14 ? 1 : normals[0]?.rank ?? 1;
    const last = normals[normals.length - 1]?.rank ?? 1;
    
    if (takeWhile(cards, x => isJoker(x)).length >= first)
        return false;
    if (takeRightWhile(cards, x => isJoker(x)).length + last > 14)
        return false;

    let expected = first;
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        if (expected === first && isJoker(card)) {
            continue;

        } else if (expected === 1 && card.rank === 14) {
            expected++;

        } else if (card.rank !== expected && !isJoker(card)) {
            return false;

        } else {
            expected++;
        }
    }

    return true;
}

function validateSkipStraight(cards: Card[], length: number): boolean {
    if (!cards?.length)
        return false;
    if (cards.length < length)
        return false;


    const normals = cards.filter(x => !isJoker(x));
    const suit = normals[0]?.suit ?? 0;
    const first = cards[0]?.rank === 14 ? 1 : normals[0]?.rank ?? 1;
    const last = normals[normals.length - 1]?.rank ?? 1;
    
    if (normals.some(x => x.suit !== suit))
        return false;
    if (takeWhile(cards, x => isJoker(x)).length * 2 >= first)
        return false;
    if (takeRightWhile(cards, x => isJoker(x)).length * 2 + last > 14)
        return false;

    let expected = first;
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        if (expected === first && isJoker(card)) {
            continue;

        } else if (expected === 1 && card.rank === 14) {
            expected += 2;

        } else if (card.rank !== expected && !isJoker(card)) {
            return false;

        } else {
            expected += 2;
        }
    }

    return true;
}

function validateHouse(cards: Card[], length: number): boolean {
    if (!cards?.length)
        return false;
    if (cards.length < length)
        return false;

    const res = countBy(cards, x => x.rank);

    const keys = Object.keys(res);
    const filteredKeys = keys.filter(key => key !== `${JOKER_RANK}`);
    if (filteredKeys.length > 2)
        return false;
    if (Math.abs(res[keys[0]] - (res[keys[1]] ?? 0)) > 1 + res[JOKER_RANK])
        return false;
    return true;
}

export function possibleMoves(session: SessionPublic): string[] {
    const moves: (GameAction | DataAction)[] = [];

    if (canSetReady(session))
        moves.push('set-ready');
    if (canRevealCard(session))
        moves.push('reveal');
    if (canCallShanghai(session))
        moves.push('call-shanghai');
    if (canDrawDeck(session))
        moves.push('draw-deck');
    if (canDrawDiscard(session))
        moves.push('draw-discard');
    if (canMeld(session))
        moves.push('meld');
    if (canAddToMeld(session))
        moves.push('add-to-meld');
    if (canDiscard(session))
        moves.push('discard');

    return moves.map(x => x.toString());

}

export function canSetReady(session: SessionPublic): boolean {
    return session.state === 'waiting-players' || session.state === 'round-end';
}

export function canRevealCard(session: SessionPublic): boolean {
    if (session.discard.top)
        return false;
    if (session.state !== 'turn-start' && session.state !== 'shanghai-called')
        return false;
    if (!session.me || session.currentPlayerId !== session.me.id)
        return false;
    return true;
}

export function canCallShanghai(session: SessionPublic): boolean {
    if (!session.me)
        return false;
    if (session.pendingShanghai)
        return false;
    if (session.state !== 'turn-start')
        return false;
    if (session.me.id === session.currentPlayerId)
        return false;
    if (session.me.id === getPrevPlayer(session.currentPlayerId, session.players).id)
        return false;
    if (!session.discard.top)
        return false;
    if (session.me.melds.length)
        return false;
    if (session.me.remainingShouts <= 0)
        return false;
    return true;
}

export function canDrawDeck(session: SessionPublic): boolean {
    if (!session.me)
        return false;
    if (session.currentPlayerId !== session.me.id)
        return false;
    if (session.state !== 'turn-start' && session.state !== 'shanghai-called')
        return false;
    if (session.deckCardAmount === 0)
        return false;
    if (!session.discard.top)
        return false;
    return true;
}

export function canDrawDiscard(session: SessionPublic): boolean {
    if (!session.me)
        return false;
    if (session.currentPlayerId !== session.me.id)
        return false;
    if (session.state !== 'turn-start' && session.state !== 'shanghai-called')
        return false;
    if (!session.discard.top)
        return false;
    return true;
}

export function canMeld(session: SessionPublic): boolean {
    if (!session.me)
        return false;
    if (session.currentPlayerId !== session.me.id)
        return false;
    if (session.state !== 'card-drawn')
        return false;
    if (session.me.melds.length !== 0)
        return false;
    return true;
}

export function canAddToMeld(session: SessionPublic): boolean {
    if (!session.me)
        return false;
    if (session.currentPlayerId !== session.me.id)
        return false;
    if (session.state !== 'card-drawn')
        return false;
    if (session.me.melds.length === 0)
        return false;
    return true;
}

export function canDiscard(session: SessionPublic): boolean {
    if (!session.me)
        return false;
    if (session.currentPlayerId !== session.me.id)
        return false;
    if (session.state !== 'card-drawn')
        return false;
    if (session.me.tempCards.length !== 0)
        return false;
    return true;
}