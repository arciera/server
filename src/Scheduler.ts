import EventEmitter from "node:events";
import {randomUUID} from "node:crypto";
import TypedEventEmitter from "./types/TypedEventEmitter";

type SchedulerEvents = {
    /**
     * Scheduler is paused
     */
    paused: () => void;

    /**
     * Scheduler is started/resumed
     */
    started: () => void;

    /**
     * Scheduler terminated
     */
    terminating: () => void;
}

class Scheduler extends (EventEmitter as new () => TypedEventEmitter<SchedulerEvents>) {
    /**
     * Scheduler age (in ticks)
     */
    #age: number = 0;

    /**
     * Whether the scheduler is running
     */
    #running: boolean = false;

    /**
     * Scheduler tasks
     */
    readonly #tasks: Scheduler.Task[] = [];

    #schedulerStopResolve: ((value: true | PromiseLike<true>) => void) | null = null;
    #schedulerStopPromise: Promise<true> | null = null;

    /**
     * Time of last tick
     */
    private lastTick: Date = new Date();

    /**
     * Create scheduler
     *
     * @param frequency Scheduler clock frequency in Hz
     * @param [start] Start scheduler
     */
    public constructor(public readonly frequency: number, start?: boolean) {
        super();
        if (start) this.start();
    }

    /**
     * Start scheduler
     */
    public start(): void {
        this.#running = true;
        this.#schedulerStopPromise = new Promise<true>(r => this.#schedulerStopResolve = r);
        this._nextTick();
        this.emit("started");
    }

    /**
     * Stop scheduler. The scheduler can be re-started afterwards and any previously scheduled tasks will continue being executed.
     * @returns Promise that resolves when the scheduler has paused. The promise resolves to false if the scheduler was not running.
     */
    public pause(): Promise<boolean> {
        if (!this.#running) return Promise.resolve(false);
        this.#running = false;
        this.emit("paused");
        return this.#schedulerStopPromise!;
    }

    /**
     * Terminate scheduler. The scheduler is stopped and any previously scheduled tasks are marked as not planned and then deleted.
     * @returns Promise that resolves when the scheduler has stopped. The promise resolves to false if the scheduler was not running.
     */
    public stop(): Promise<boolean> {
        if (!this.#running) return Promise.resolve(false);
        this.#running = false;
        this.#tasks.forEach(task => {
            task.emit("notPlanned");
        });
            this.delete(task);
        this.emit("terminating");
        return this.#schedulerStopPromise!;
    }

    /**
     * Scheduler age
     */
    public get age(): number {
        return this.#age;
    }

    /**
     * Whether the scheduler is running
     */
    public get running(): boolean {
        return this.#running;
    }

    /**
     * Convert milliseconds to scheduler ticks
     *
     * @param ms Milliseconds
     */
    public msToTicks(ms: number): number {
        return ms / (1000 / this.frequency);
    }

    /**
     * Convert scheduler ticks to milliseconds
     *
     * @param ticks Ticks
     */
    public ticksToMs(ticks: number): number {
        return ticks * (1000 / this.frequency);
    }

    /**
     * Estimate scheduler age at a specific date
     *
     * > [!NOTE]
     * > If the scheduler is paused, IRL time will pass without the scheduler aging, resulting in incorrect estimation.
     * > This estimation will only be correct if the scheduler is not paused (or terminated) before the given date.
     *
     * @param date Date to estimate scheduler age at
     */
    public estimateAge(date: Date): number {
        return this.age + this.msToTicks(date.getTime() - this.lastTick.getTime());
    }

    /**
     * Scheduler tick
     */
    private tick(): void {
        const now = new Date();
        if (now.getTime() - this.lastTick.getTime() < this.ticksToMs(1)) return this._nextTick();
        ++this.#age;
        this.lastTick = now;
        const tasks = this.#tasks.filter(task => task.targetAge <= this.#age).sort((a, b) => a.targetAge - b.targetAge);
        for (const task of tasks) {
            this.delete(task);
            task.run();
        }

        this._nextTick();
    }

    /**
     * Request next tick
     */
    private _nextTick(): void {
        if (!this.#running) {
            if (this.#schedulerStopResolve) {
                this.#schedulerStopResolve(true);
                this.#schedulerStopResolve = null;
            }
            return;
        }
        setImmediate(this.tick.bind(this));
    }

    /**
     * Schedule task to run at a specific scheduler age (tick)
     *
     * @param code Task code
     * @param targetAge Target scheduler age (tick) to run task at
     */
    public scheduleAge(code: () => void, targetAge: number): Scheduler.Task {
        const task = new Scheduler.Task(code, targetAge, this);
        this.#tasks.push(task);
        return task;
    }

    /**
     * Schedule task to run after the specified amount of ticks
     *
     * @param code Task code
     * @param ticks Number of ticks to wait before running the task
     */
    public scheduleTicks(code: () => void, ticks: number): Scheduler.Task {
        return this.scheduleAge(code, this.age + ticks);
    }

    /**
     * Schedule task to be executed as soon as possible
     *
     * @param code Task code
     */
    public schedule(code: () => void): Scheduler.Task {
        return this.scheduleTicks(code, 0);
    }

    /**
     * Delete task from the scheduler queue
     *
     * @param task Task to cancel
     * @internal
     */
    private delete(task: Scheduler.Task): boolean {
        const index = this.#tasks.indexOf(task);
        if (index < 0) return false;
        this.#tasks.splice(index, 1);
        return true;
    }

    /**
     * Cancel execution of a task
     *
     * @param task Task to cancel
     * @returns `false` if the task was not found in the scheduler queue (possibly already executed), `true` otherwise
     */
    public cancel(task: Scheduler.Task): boolean {
        const deleted = this.delete(task);
        if (deleted) task.emit("cancelled");
        return deleted;
    }

    /**
     * Get task from the scheduler queue by ID
     *
     * @param id Task ID
     */
    public getTaskById(id: string): Scheduler.Task | undefined {
        return this.#tasks.find(task => task.id === id);
    }
}

namespace Scheduler {
    type TaskEvents = {
        /**
         * Task is not planned to be executed due to the scheduler being terminated
         */
        "notPlanned": () => void;

        /**
         * Task is cancelled
         */
        "cancelled": () => void;
    }

    /**
     * Scheduler task
     */
    export class Task extends (EventEmitter as new () => TypedEventEmitter<TaskEvents>) {
        /**
         * Task ID
         */
        public readonly id = randomUUID();

        /**
         * Task code
         */
        private readonly code: () => void;

        /**
         * Target scheduler age (tick) to run task at
         */
        public readonly targetAge: number;

        /**
         * Task scheduler
         */
        public readonly scheduler: Scheduler;

        /**
         * Whether the task has been executed
         */
        #executed: boolean = false;

        /**
         * Create scheduler task
         *
         * @param code Task code
         * @param targetAge Target scheduler age
         * @param scheduler Scheduler
         */
        public constructor(code: () => void, targetAge: number, scheduler: Scheduler) {
            super();
            this.code = code;
            this.targetAge = targetAge;
            this.scheduler = scheduler;
        }

        /**
         * Whether the task has been executed
         */
        public get executed(): boolean {
            return this.#executed;
        }

        /**
         * The remaining ticks before the task is run.
         *
         * - `0`: the task is being run
         * - positive int: the task will be run in this many ticks
         * - negative int: the task was run this many ticks ago
         *
         * To check if the task was actually run, use {@link Task#executed}
         */
        public get remainingTicks(): number {
            return this.targetAge - this.scheduler.age;
        }

        /**
         * Cancel execution of this task
         * @see Scheduler#cancel
         */
        public cancel(): boolean {
            return this.scheduler.cancel(this);
        }

        /**
         * Run task
         * @internal
         */
        public run(): void {
            this.code();
            this.#executed = true;
        }
    }
}

export default Scheduler;
