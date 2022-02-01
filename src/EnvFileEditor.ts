import { getFile, saveToFile } from "./utils/Files"

interface KeyValue  { [key: string] : ValueType }
type ValueType = string | number | null

export default class {
    private filePath: string
    private loaded: boolean = false

    private rawEnv: string
    private env: KeyValue
    private envKeys: string[]

    constructor(file: string) {
        this.filePath = file
        this.rawEnv = ''
        this.env = { }
        this.envKeys = []
    }

    private parseRawEnv(rawEnv: string) {
        const lines = rawEnv.split(`\n`)
        const uncommentedLines = lines?.filter(line => !line.startsWith('#') && line.trim().length > 0)

        const env = uncommentedLines?.reduce((accum, line) => {
            const equalsIndex = line.indexOf('=')
            const key = line.substring(0, equalsIndex)
            const value = line.substring(equalsIndex + 1)
            if (!key) {
                return accum;
            }

            return { ...accum, [key]: value }
        }, { })

        return env;
    }

    private updateRawEnv(rawEnv: string, env: KeyValue) {
        const lines = rawEnv.split(`\n`)
        
        const updatedLines = lines.map((line) => {
            if(line.startsWith ('#') || line.trim().length === 0) {
                return line
            }
            const equalsIndex = line.indexOf('=')
            const key = line.substring(0, equalsIndex)

            if(key.trim().length === 0) {
                return line;
            }
            
            if(env[key] === null) {
                return null
            }

            if(env[key] === undefined) {
                return line
            }

            return `${key}=${env[key]}`
        }).filter((line) => line !== null)
        
        const newEnvKeys = Object.keys(env).filter((key: string) => env[key] !== null && !this.envKeys.includes(key))
        const newEnvLines = newEnvKeys.map((key) => `${key}=${env[key]}`)
        
        return [...updatedLines, ...newEnvLines].join('\n');
    }

    async load() {
        try {
            this.rawEnv = await getFile(this.filePath)
        } catch(e) {
            this.rawEnv = ''
        }
        this.env = this.parseRawEnv(this.rawEnv || '')
        this.envKeys = Object.keys(this.env)
        this.loaded = true
    }

    getEnv(key: string, defaultValue?: string) {
        if(!this.loaded) {
            throw new Error('Must call load() before retrieving env value')
        }

        return this.env[key] || defaultValue
    }

    setEnv(key: string, value: string | number) {
        if(!this.loaded) {
            throw new Error('Must call load() before setting env value')
        }

        this.env[key] = value
    }

    deleteEnv(key: string) {
        if(!this.loaded) {
            throw new Error('Must call load() before setting env value')
        }

        this.env[key] = null;
    }

    async commit() {
        if(!this.loaded) {
            throw new Error('Must call load() before committing')
        }

        this.rawEnv = this.updateRawEnv(this.rawEnv, this.env)
        for(const key of this.envKeys) {
            if(this.env[key] === null) {
                delete this.env[key]
            }
        }
        this.envKeys = Object.keys(this.env)

        return saveToFile(this.filePath, this.rawEnv)
    }
}