import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export function saveJson(filepath: string, json: any, beautify: boolean) {
    const folder = getFolder(filepath);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    
    const jsonString: string = beautify ? JSON.stringify(json, null, '\t') : JSON.stringify(json);
    
    fs.writeFile(`${filepath}`, jsonString, function (error) {
        if (error) {
            console.log('Error saving file', { folder, filepath });
        }
    });
}

export async function loadJson(filepath: string) {
    if (!fs.existsSync(filepath)) {
        return null;
    }
    
    const jsonString: any = await readFile(filepath);
    return JSON.parse(jsonString);
}

function getFolder(filepath: string): string {
    return filepath.replace(/\/[^/]*$/i, '/');
}