import { Card, JOKER_RANK, Meld, MeldConfig } from './types';
import _, { maxBy, minBy } from 'lodash';

export function validateMelds(melds: Meld[], configs: MeldConfig[]): boolean {
    configs = [...configs];
    
    for (let i = 0; i < melds.length; i++) {
        const index = configs.findIndex(config => validateMeld(melds[i], config));
        if (index === -1)
            return false;
        configs.splice(index, 1);
    }
    
    return true;
}

export function validateMeld(meld: Meld, config: MeldConfig): boolean {
    switch (config.type) {
        case 'set':
            return validateSet(meld, config.length);
        case 'straight':
            return validateStraight(meld, config.length);
        case 'any-straight':
            return validateAnyStraight(meld, config.length);
        case 'house':
            return validateHouse(meld, config.length);
        default:
            throw Error('Invalid meld type');
    }
}

export function isJoker(card: Card): boolean {
    return card.rank === JOKER_RANK;
}

function validateSet(meld: Meld, length: number): boolean {
    if (!meld?.cards?.length)
        return false;
    if (meld.cards.length !== length)
        return false;
    const rank = meld.cards[0].rank;
    if (meld.cards.some(x => x.rank !== rank && !isJoker(x)))
        return false;
    return true;
}

function validateStraight(meld: Meld, length: number): boolean {
    if (!meld?.cards?.length)
        return false;
    if (meld.cards.length !== length)
        return false;
    const suit = meld.cards[0].suit;
    if (meld.cards.some(x => x.suit !== suit && !isJoker(x)))
        return false;

    const min = minBy(meld.cards.filter(x => !isJoker(x)), x => x.rank)!.rank;
    const max = maxBy(meld.cards.filter(x => !isJoker(x)), x => x.rank)!.rank;

    let jokers = meld.cards.filter(x => isJoker(x)).length;
    for (let i = min; i <= max; i++) {
        if (!meld.cards.find(x => x.rank === i) && jokers-- <= 0)
            return false;
    }

    return true;

}

function validateAnyStraight(meld: Meld, length: number): boolean {
    if (!meld?.cards?.length)
        return false;
    if (meld.cards.length !== length)
        return false;
    
    const min = minBy(meld.cards.filter(x => !isJoker(x)), x => x.rank)!.rank;
    const max = maxBy(meld.cards.filter(x => !isJoker(x)), x => x.rank)!.rank;

    let jokers = meld.cards.filter(x => isJoker(x)).length;
    for (let i = min; i <= max; i++) {
        if (!meld.cards.find(x => x.rank === i) && jokers-- <= 0)
            return false;
    }

    return true;
}

function validateHouse(meld: Meld, length: number): boolean {
    if (!meld?.cards?.length)
        return false;
    if (meld.cards.length !== length)
        return false;
    
    const res = _.countBy(meld.cards, x => `${x.rank}|${x.suit}`);
    
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