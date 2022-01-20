"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerTurn = exports.getPlayerByName = exports.getCurrentPlayer = exports.cardOrderIndex = exports.CSuitIcon = exports.CSuit = void 0;
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
const getCurrentPlayer = (state) => state.players[(0, exports.getPlayerTurn)(state, state.turn)];
exports.getCurrentPlayer = getCurrentPlayer;
const getPlayerByName = (state, name) => state.players.filter(p => p.name === name)[0];
exports.getPlayerByName = getPlayerByName;
const getPlayerTurn = (state, turnIndex) => turnIndex % state.players.length;
exports.getPlayerTurn = getPlayerTurn;
