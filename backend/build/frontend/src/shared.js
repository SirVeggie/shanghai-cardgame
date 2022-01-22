"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerTurn = exports.getPlayerByName = exports.getCurrentPlayerId = exports.getCurrentPlayer = exports.cardOrderIndex = exports.CSuitIcon = exports.CSuit = void 0;
var CSuit;
(function (CSuit) {
    CSuit[CSuit["club"] = 0] = "club";
    CSuit[CSuit["heart"] = 1] = "heart";
    CSuit[CSuit["spade"] = 2] = "spade";
    CSuit[CSuit["diamond"] = 3] = "diamond";
})(CSuit = exports.CSuit || (exports.CSuit = {}));
var CSuitIcon;
(function (CSuitIcon) {
    CSuitIcon[CSuitIcon["\u2663"] = 0] = "\u2663";
    CSuitIcon[CSuitIcon["\u2665"] = 1] = "\u2665";
    CSuitIcon[CSuitIcon["\u2660"] = 2] = "\u2660";
    CSuitIcon[CSuitIcon["\u2666"] = 3] = "\u2666";
})(CSuitIcon = exports.CSuitIcon || (exports.CSuitIcon = {}));
const cardOrderIndex = (card) => card.suit * 1000 + card.rank * 10 + card.deck;
exports.cardOrderIndex = cardOrderIndex;
const getCurrentPlayer = (shanghai) => {
    const player = shanghai.options.players[(0, exports.getPlayerTurn)(shanghai.state, shanghai.state.turn)];
    return Object.assign(Object.assign({}, player), shanghai.state.players[player.id]);
};
exports.getCurrentPlayer = getCurrentPlayer;
const getCurrentPlayerId = (shanghai) => shanghai.options.players[(0, exports.getPlayerTurn)(shanghai.state, shanghai.state.turn)].id;
exports.getCurrentPlayerId = getCurrentPlayerId;
const getPlayerByName = (shanghai, name) => {
    const player = shanghai.options.players.filter(p => p.name === name)[0];
    return Object.assign(Object.assign({}, player), shanghai.state.players[player.id]);
};
exports.getPlayerByName = getPlayerByName;
const getPlayerTurn = (state, turnIndex) => turnIndex % state.players.length;
exports.getPlayerTurn = getPlayerTurn;
