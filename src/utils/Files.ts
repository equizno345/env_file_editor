import fs from 'fs'
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


export const getFile = async(file: string): Promise<any> => {
    try {
        return readFile(file, 'utf8');
    } catch(e) {
        console.error(`error reading file ${e}`);
    }

    return undefined
}
export const saveToFile = async(file: string, contents: string): Promise<any> => {
    try {
        return writeFile(file, contents);
    } catch(e) {
        console.error(`error writing to file ${e}`);
    }

    return undefined
}