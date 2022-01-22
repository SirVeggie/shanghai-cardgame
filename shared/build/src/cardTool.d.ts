import { Card, CRank, CSuit, CColor, CNormalRank } from '../index';
declare const _default: {
    fromId: (id: number) => Card;
    fromValues: (rank: CRank, suit: CSuit, deck: number) => Card;
    color: (card: Card) => CColor;
    name: (card: Card) => string;
    longName: (card: Card) => string;
    suitName: (card: Card) => string;
    suitIcon: (card: Card) => string;
    rankName: (card: Card) => string;
    rankPrefix: (card: Card) => string;
    nextRank: (rank: CNormalRank, loop?: boolean) => CNormalRank | undefined;
};
export default _default;
