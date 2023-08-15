import { open, access, constants, FileHandle } from "node:fs/promises";
import Logger from "./Logger.js";


export interface Config {
    /**
     * Port to listen on 
    */
    port: number;

    /**
     * The level to display logs at
     */
    logLevel: Logger.Level;

    /**
     * Kick reason for when the server is shutting down
     */
    shutdownKickReason: ChatComponent;
}

export class ConfigLoader {
    /**
     * Get a Config instance from a json file
     * @param file The file to read from
     * @returns a promise that resolves to a Config instance
     * @throws if the file does not exist or is invalid
     */
    public static async fromFile(file: string): Promise<Config> {
        let config: Config = ConfigLoader.getDefault();
        let logger: Logger = new Logger("Config", config.logLevel);
        if (!(await ConfigLoader.exists(file))) {
            logger.warn("Config does not exist, creating default '%s'", file);
            await ConfigLoader.createDefault(file);
            return config;
        }
        const fd: FileHandle = await open(file, "r");
        const data: string = await fd.readFile("utf-8");
        fd.close();

        config = JSON.parse(data) as Config;

        return config;
    }

    /**
     * Get a default config instance
     * @returns a default config instance
     */
    public static getDefault(): Config {
        return {
            port: 25565,
            logLevel: Logger.Level.INFO,
            shutdownKickReason: {
                text: "Server closed"
            }
        };

    }

    /**
     * Checks if a config exists
     * @param file The file to check
     * @returns a promise that resolves to a boolean
     */
    public static async exists(file: string): Promise<boolean> {
        try {
            await access(file, constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create the default config file
     */
    public static async createDefault(file: string): Promise<void> {
        const fd = await open(file, "w");
        await fd.writeFile(JSON.stringify(ConfigLoader.getDefault(), null, 4));
        fd.close();
    }
}

