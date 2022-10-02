import { loadJson, saveJson } from './jsonFiles';

export function log(message: any, type: string = 'error') {
    if (!message || typeof message === 'function')
        return;
    if (typeof message !== 'object')
        message = { message };
    const logMessage = {
        type,
        date: new Date().toISOString(),
        message,
    };
    console.log(logMessage);
    loadJson('log.json').then((log) => {
        if (!log)
            log = [logMessage];
        else
            log.push(logMessage);
        saveJson('log.json', logMessage, true);
    });
}