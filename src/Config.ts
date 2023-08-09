import { readFile, stat } from "node:fs/promises";

export class Config {
    public port: number = 25565;

    public constructor(file: string) {
        // check if file exists
        // exists is not available as a promise in node:fs/promises
        stat(file).then((stats) => {
            if (!stats.isFile()) throw new Error("Config file is not a file");
        }).catch(() => {
            throw new Error("Config file does not exist");
        });

        readFile(file, "utf-8").then((data) => {
            const config = JSON.parse(data) as Config;
            this.port = config.port;
        });
    }

}
