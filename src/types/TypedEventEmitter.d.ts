/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Andy Wermke
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
export default interface TypedEventEmitter<Events extends EventMap> {
    addListener<E extends keyof Events> (event: E, listener: Events[E]): this
    on<E extends keyof Events> (event: E, listener: Events[E]): this
    once<E extends keyof Events> (event: E, listener: Events[E]): this
    prependListener<E extends keyof Events> (event: E, listener: Events[E]): this
    prependOnceListener<E extends keyof Events> (event: E, listener: Events[E]): this

    off<E extends keyof Events>(event: E, listener: Events[E]): this
    removeAllListeners<E extends keyof Events> (event?: E): this
    removeListener<E extends keyof Events> (event: E, listener: Events[E]): this

    emit<E extends keyof Events> (event: E, ...args: Parameters<Events[E]>): boolean
    // The sloppy `eventNames()` return type is to mitigate type incompatibilities - see #5
    eventNames (): (keyof Events | string | symbol)[]
    rawListeners<E extends keyof Events> (event: E): Events[E][]
    listeners<E extends keyof Events> (event: E): Events[E][]
    listenerCount<E extends keyof Events> (event: E): number

    getMaxListeners (): number
    setMaxListeners (maxListeners: number): this
}
export type EventMap = {
    [key: string]: (...args: any[]) => void
}
