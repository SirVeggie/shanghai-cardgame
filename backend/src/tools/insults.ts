import { randomIndex } from './utils';

const insults = [
    '[player] is so slow, if he was going any slower, he would be going backwards',
    'Watching [player] play is like watching paint dry',
    'Watching grass grow is more exciting than watching [player] play',
    '[player]\'s play style is so bad, he\'s probably the reason why the dinosaurs went extinct (AI generated)',
    '[player]\'s play is slower than dial-up',
    '[player] plays like a herd of turtles, frankly it\'s cute',
    '[player] plays so slow you\'d think he went to buy milk',
    'You might as well go get a drink while waiting for [player] to play',
];

export function randomInsult(name: string): string {
    return insults[randomIndex(insults)].replace('[player]', name);
}