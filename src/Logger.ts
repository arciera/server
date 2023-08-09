class Logger {
    private readonly name: string;

    public constructor(name: string) {
        this.name = name;
    }

    /**
     * Print object without any log level
     * @param obj Object to print
     */
    private send(...obj: any[]): void {
        console.log(...obj);
    }

    /**
     * Format string with log level and prefix
     * @param level Log level
     * @param message Message to format
     */
    private format(level: Logger.Level, message: string): string {
        return `${Logger.text256(240)}[${new Date().toISOString()}] ${Logger.ansi.format.reset}${Logger.level[level]}[${this.name}/${level}]${Logger.ansi.format.reset} ${message}${Logger.ansi.format.reset}`;
    }

    /**
     * Log message
     * @param level Log level
     * @param message Message to log
     * @param [obj] Objects to print
     */
    public log(level: Logger.Level, message: string, ...obj: any[]): void {
        this.send(this.format(level, message), ...obj);
    }

    /**
     * Log info message
     * @param message Message to log
     * @param [obj] Objects to print
     */
    public info(message: string, ...obj: any[]): void {
        this.log(Logger.Level.INFO, message, ...obj);
    }

    /**
     * Log warning message
     * @param message Message to log
     * @param [obj] Objects to print
     */
    public warn(message: string, ...obj: any[]): void {
        this.log(Logger.Level.WARN, message, ...obj);
    }

    /**
     * Log error message
     * @param message Message to log
     * @param [obj] Objects to print
     */
    public error(message: string, ...obj: any[]): void {
        this.log(Logger.Level.ERROR, message, ...obj);
    }

    /**
     * Log success message
     * @param message Message to log
     * @param [obj] Objects to print
     */
    public success(message: string, ...obj: any[]): void {
        this.log(Logger.Level.SUCCESS, message, ...obj);
    }

    /**
     * Log debug message
     * @param message Message to log
     * @param [obj] Objects to print
     */
    public debug(message: string, ...obj: any[]): void {
        this.log(Logger.Level.DEBUG, message, ...obj);
    }

    /**
     * ANSI escape codes
     */
    public static readonly ansi = Object.freeze({
        text: {
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            bright: {
                black: "\x1b[30;1m",
                red: "\x1b[31;1m",
                green: "\x1b[32;1m",
                yellow: "\x1b[33;1m",
                blue: "\x1b[34;1m",
                magenta: "\x1b[35;1m",
                cyan: "\x1b[36;1m",
                white: "\x1b[37;1m",
            }
        },
        background: {
            black: "\x1b[40m",
            red: "\x1b[41m",
            green: "\x1b[42m",
            yellow: "\x1b[43m",
            blue: "\x1b[44m",
            magenta: "\x1b[45m",
            cyan: "\x1b[46m",
            white: "\x1b[47m",
            bright: {
                black: "\x1b[40;1m",
                red: "\x1b[41;1m",
                green: "\x1b[42;1m",
                yellow: "\x1b[43;1m",
                blue: "\x1b[44;1m",
                magenta: "\x1b[45;1m",
                cyan: "\x1b[46;1m",
                white: "\x1b[47;1m",
            }
        },
        format: {
            reset: "\x1b[0m",
            bold: "\x1b[1m",
            underline: "\x1b[4m",
            blink: "\x1b[5m",
            reverse: "\x1b[7m",
            hidden: "\x1b[8m",
            dim: "\x1b[2m"
        }
    });

    /**
     * Level formatting
     */
    public static readonly level: Record<string, string> = Object.freeze({
        "DEBUG": Logger.ansi.text.bright.magenta,
        "INFO": Logger.ansi.text.bright.blue,
        "SUCCESS": Logger.ansi.text.bright.green,
        "WARN": Logger.ansi.text.bright.yellow,
        "ERROR": Logger.ansi.text.bright.red,
    });

    /**
     * 256 colors
     * @param colour Colour ID from 0 to 255
     */
    public static text256(colour: number): string {
        return `\x1b[38;5;${colour}m`;
    }

    /**
     * 256 colors
     * @param colour Colour ID from 0 to 255
     */
    public static background256(colour: number): string {
        return `\x1b[48;5;${colour}m`;
    }

    /**
     * RGB colors
     * @param red Red value from 0 to 255
     * @param green Green value from 0 to 255
     * @param blue Blue value from 0 to 255
     */
    public static textRGB(red: number, green: number, blue: number): string {
        return `\x1b[38;2;${red};${green};${blue}m`;
    }

    /**
     * RGB colors
     * @param red Red value from 0 to 255
     * @param green Green value from 0 to 255
     * @param blue Blue value from 0 to 255
     */
    public static backgroundRGB(red: number, green: number, blue: number): string {
        return `\x1b[48;2;${red};${green};${blue}m`;
    }
}

namespace Logger {
    /**
     * Log Level
     */
    export enum Level {
        /**
         * Info
         */
        INFO = "INFO",

        /**
         * Warning
         */
        WARN = "WARN",

        /**
         * Error
         */
        ERROR = "ERROR",

        /**
         * Success
         */
        SUCCESS = "SUCCESS",

        /**
         * Debug
         */
        DEBUG = "DEBUG"
    }
}

export default Logger;
