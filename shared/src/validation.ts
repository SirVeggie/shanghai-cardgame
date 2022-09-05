import { Card, GameConfig, GameJoinParams, JOKER_RANK, Meld, MeldConfig, MELD_TYPES } from './types';
import { countBy, minBy } from 'lodash';
import { assertNever, userError } from '.';

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

    // force smaller melds and configs to be checked first
    melds = [...melds].sort((a, b) => a.cards.length - b.cards.length);
    const configsCopy = [...configs].sort((a, b) => a.length - b.length);

    for (let i = 0; i < melds.length; i++) {
        const index = configsCopy.findIndex(config => validateMeld(melds[i].cards, config));
        if (index === -1)
            return false;
        configsCopy.splice(index, 1);
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

    const rank = cards[0].rank;
    if (cards.some(x => x.rank !== rank && !isJoker(x)))
        return false;
    return true;
}

function validateStraight(cards: Card[], length: number): boolean {
    if (!cards?.length)
        return false;
    if (cards.length < length)
        return false;

    const suit = cards[0].suit;
    if (cards.some(x => x.suit !== suit && !isJoker(x)))
        return false;

    const min = minBy(cards.filter(x => !isJoker(x)), x => x.rank)!.rank;
    let expected = min;
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (expected === min && isJoker(card))
            continue;
        if (card.rank !== expected && !isJoker(card))
            return false;
        expected++;
    }

    return true;

}

function validateAnyStraight(cards: Card[], length: number): boolean {
    if (!cards?.length)
        return false;
    if (cards.length < length)
        return false;

    const min = minBy(cards.filter(x => !isJoker(x)), x => x.rank)!.rank;
    let expected = min;
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (expected === min && isJoker(card))
            continue;
        if (card.rank !== expected && !isJoker(card))
            return false;
        expected++;
    }

    return true;
}

function validateSkipStraight(cards: Card[], length: number): boolean {
    if (!cards?.length)
        return false;
    if (cards.length < length)
        return false;

    const suit = cards[0].suit;
    if (cards.some(x => x.suit !== suit && !isJoker(x)))
        return false;

    const min = minBy(cards.filter(x => !isJoker(x)), x => x.rank)!.rank;
    let expected = min;
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (expected === min && isJoker(card))
            continue;
        if (card.rank !== expected && !isJoker(card))
            return false;
        expected += 2;
    }

    return true;
}

function validateHouse(cards: Card[], length: number): boolean {
    if (!cards?.length)
        return false;
    if (cards.length < length)
        return false;

    const res = countBy(cards, x => `${x.rank}|${x.suit}`);

    const keys = Object.keys(res);
    const filteredKeys = keys.filter(x => x.split('|')[0] === `${JOKER_RANK}`);
    if (filteredKeys.length < 2)
        return true;
    if (filteredKeys.length > 2)
        return false;
    if (Math.abs(res[keys[0]] - res[keys[1]]) > 1)
        return false;
    return true;
}