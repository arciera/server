import { open } from "node:fs/promises";
import Logger from "./Logger.js";

export default class Config {
    public port: number = 25565;

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
            return config;
        } catch {
            new Logger("Config").error("Failed to read config file, using default config");
            return new Config();
        }
    }

}
