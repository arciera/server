import { open } from "node:fs/promises";
import Logger from "./Logger.js";

export interface Config {
    /**
     * Port to listen on
     */
    port: number;

    /**
     * Kick reason for when the server is shutting down
     */
    shutdownKickReason: string;
}

export class ConfigLoader {
    /**
     * Get a Config instance from a json file
     * @param file The file to read from
     * @returns a promise that resolves to a Config instance
     */
    public static async fromFile(file: string): Promise<Config> {
        try {
            const fd = await open(file, "r");
            const data = await fd.readFile("utf-8");
            const config = JSON.parse(data) as Config;
            fd.close();
            return config;
        } catch {
            new Logger("Config").error("Failed to read config file, using the default config");
            return ConfigLoader.getDefault();
        }
    }

    /**
     * Get a default config instance
     * @returns a default config instance
    **/
    public static getDefault(): Config {
        return {
            port: 25565,
            shutdownKickReason: "Server shutting down"
        };
    }
}

