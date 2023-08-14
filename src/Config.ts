import { open } from "node:fs/promises";
import Logger from "./Logger.js";

export default class Config {
    public port: number = 25565;
    public logLevel: Logger.Level = Logger.Level.INFO;

    /**
     * Kick reason for when the server is shutting down
     */
    public shutdownKickReason: string = "Server closed";

    /**
     * Get a Config instance from a json file
     * @param file The file to read from
     * @returns a promise that resolves to a Config instance
     */
    public static async fromFile(file: string): Promise<Config> {
        let config: Config;
        try {
            const fd = await open(file, "r");
            const data = await fd.readFile("utf-8");
            config = JSON.parse(data) as Config;
            fd.close();
        } catch {
            config = new Config();
            new Logger("Config", config.logLevel).error("Failed to read config file, using default config");
        }
        return config;
    }

}
