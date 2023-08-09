import { readFile, stat } from "node:fs/promises";

export class Config {
    public port: number = 25565;

    /**
     * Get a Config instance from a json file
     * @param file The file to read from
     * @returns a promise that resolves to a Config instance
     */
    public static async fromFile(file: string): Promise<Config> {
        try {
            const stats = await stat(file);
            if (!stats.isFile()) throw new Error("Config file is not a file");
        } catch {
            throw new Error("Config file does not exist");
        }
        const data = await readFile(file, "utf-8");
        const config = JSON.parse(data) as Config;
        return config;
    }

}
