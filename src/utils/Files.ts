import fs from 'fs'
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


export const getFile = async(file: string): Promise<any> => {
    try {
        return readFile(file, 'utf8')
    } catch(e) {
        throw e
    }
}
export const saveToFile = async(file: string, contents: string): Promise<any> => {
    try {
        await writeFile(file, contents);
    } catch(e) {
        throw e
    }
}