// @ts-nocheck
/*
    NBT.js - a JavaScript parser for NBT archives
    by Sijmen Mulder

    I, the copyright holder of this work, hereby release it into the public
    domain. This applies worldwide.

    In case this is not legally possible: I grant anyone the right to use this
    work for any purpose, without any conditions, unless such conditions are
    required by law.
*/

'use strict';

if (typeof ArrayBuffer === 'undefined') {
    throw new Error('Missing required type ArrayBuffer');
}
if (typeof DataView === 'undefined') {
    throw new Error('Missing required type DataView');
}
if (typeof Uint8Array === 'undefined') {
    throw new Error('Missing required type Uint8Array');
}

const nbt: { tagTypes: NbtTagTypes } = {
    tagTypes: {
        end: 0,
        byte: 1,
        short: 2,
        int: 3,
        long: 4,
        float: 5,
        double: 6,
        byteArray: 7,
        string: 8,
        list: 9,
        compound: 10,
        intArray: 11,
        longArray: 12
    }
};

export const tagTypes = {
    'end': 0,
    'byte': 1,
    'short': 2,
    'int': 3,
    'long': 4,
    'float': 5,
    'double': 6,
    'byteArray': 7,
    'string': 8,
    'list': 9,
    'compound': 10,
    'intArray': 11,
    'longArray': 12
};


/**
 * A mapping from type names to NBT type numbers.
 * {@link module:nbt.Writer} and {@link module:nbt.Reader}
 * have corresponding methods (e.g. {@link module:nbt.Writer#int})
 * for every type.
 *
 * @type Object<string, number>
 * @see module:nbt.tagTypeNames */
nbt.tagTypes = tagTypes;

/**
 * A mapping from NBT type numbers to type names.
 *
 * @type Object<number, string>
 * @see module:nbt.tagTypes */
nbt.tagTypeNames = {};
(function() {
    for (let typeName in nbt.tagTypes) {
        if (nbt.tagTypes.hasOwnProperty(typeName)) {
            nbt.tagTypeNames[nbt.tagTypes[typeName]] = typeName;
        }
    }
})();

function hasGzipHeader(data) {
    const head = new Uint8Array(data.slice(0, 2));
    return head.length === 2 && head[0] === 0x1f && head[1] === 0x8b;
}

function encodeUTF8(str) {
    const array = [];
    let i, c;
    for (i = 0; i < str.length; i++) {
        c = str.charCodeAt(i);
        if (c < 0x80) {
            array.push(c);
        } else if (c < 0x800) {
            array.push(0xC0 | c >> 6);
            array.push(0x80 | c         & 0x3F);
        } else if (c < 0x10000) {
            array.push(0xE0 |  c >> 12);
            array.push(0x80 | (c >>  6) & 0x3F);
            array.push(0x80 |  c        & 0x3F);
        } else {
            array.push(0xF0 | (c >> 18) & 0x07);
            array.push(0x80 | (c >> 12) & 0x3F);
            array.push(0x80 | (c >>  6) & 0x3F);
            array.push(0x80 |  c        & 0x3F);
        }
    }
    return array;
}

function decodeUTF8(array) {
    let codepoints = [], i;
    for (i = 0; i < array.length; i++) {
        if ((array[i] & 0x80) === 0) {
            codepoints.push(array[i] & 0x7F);
        } else if (i+1 < array.length &&
                    (array[i]   & 0xE0) === 0xC0 &&
                    (array[i+1] & 0xC0) === 0x80) {
            codepoints.push(
                ((array[i]   & 0x1F) << 6) |
                ( array[i+1] & 0x3F));
        } else if (i+2 < array.length &&
                    (array[i]   & 0xF0) === 0xE0 &&
                    (array[i+1] & 0xC0) === 0x80 &&
                    (array[i+2] & 0xC0) === 0x80) {
            codepoints.push(
                ((array[i]   & 0x0F) << 12) |
                ((array[i+1] & 0x3F) <<  6) |
                ( array[i+2] & 0x3F));
        } else if (i+3 < array.length &&
                    (array[i]   & 0xF8) === 0xF0 &&
                    (array[i+1] & 0xC0) === 0x80 &&
                    (array[i+2] & 0xC0) === 0x80 &&
                    (array[i+3] & 0xC0) === 0x80) {
            codepoints.push(
                ((array[i]   & 0x07) << 18) |
                ((array[i+1] & 0x3F) << 12) |
                ((array[i+2] & 0x3F) <<  6) |
                ( array[i+3] & 0x3F));
        }
    }
    return String.fromCharCode.apply(null, codepoints);
}

/* Not all environments, in particular PhantomJS, supply
   Uint8Array.slice() */
function sliceUint8Array(array, begin, end) {
    if ('slice' in array) {
        return array.slice(begin, end);
    } else {
        return new Uint8Array([].slice.call(array, begin, end));
    }
}

/**
 * In addition to the named writing methods documented below,
 * the same methods are indexed by the NBT type number as well,
 * as shown in the example below.
 *
 * @constructor
 * @see module:nbt.Reader
 *
 * @example
 * var writer = new nbt.Writer();
 *
 * // all equivalent
 * writer.int(42);
 * writer ;
 * writer(nbt.tagTypes.int)(42);
 *
 * // overwrite the second int
 * writer.offset = 0;
 * writer.int(999);
 *
 * return writer.buffer; */
nbt.Writer = function() {
    const self = this;

    /* Will be resized (x2) on write if necessary. */
    let buffer = new ArrayBuffer(1024);

    /* These are recreated when the buffer is */
    let dataView = new DataView(buffer);
    let arrayView = new Uint8Array(buffer);

    /**
     * The location in the buffer where bytes are written or read.
     * This increases after every write, but can be freely changed.
     * The buffer will be resized when necessary.
     *
     * @type number */
    this.offset = 0;

    // Ensures that the buffer is large enough to write `size` bytes
    // at the current `self.offset`.
    function accommodate(size) {
        const requiredLength = self.offset + size;
        if (buffer.byteLength >= requiredLength) {
            return;
        }

        let newLength = buffer.byteLength;
        while (newLength < requiredLength) {
            newLength *= 2;
        }

        const newBuffer = new ArrayBuffer(newLength);
        const newArrayView = new Uint8Array(newBuffer);
        newArrayView.set(arrayView);

        // If there's a gap between the end of the old buffer
        // and the start of the new one, we need to zero it out
        if (self.offset > buffer.byteLength) {
            newArrayView.fill(0, buffer.byteLength, self.offset);
        }

        buffer = newBuffer;
        dataView = new DataView(newBuffer);
        arrayView = newArrayView;
    }

    function write(dataType, size, value) {
        accommodate(size);
        dataView['set' + dataType](self.offset, value);
        self.offset += size;
        return self;
    }

    /**
     * Returns the written data as a slice from the internal buffer,
     * cutting off any padding at the end.
     *
     * @returns {ArrayBuffer} a [0, offset] slice of the internal buffer */
    this.getData = function() {
        accommodate(0);  /* make sure the offset is inside the buffer */
        return buffer.slice(0, self.offset);
    };

    /**
     * @method module:nbt.Writer#byte
     * @param {number} value - a signed byte
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.byte] = write.bind

(null, 'Int8', 1);

    /**
     * @method module:nbt.Writer#short
     * @param {number} value - a signed 16-bit integer
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.short] = write.bind(null, 'Int16', 2);

    /**
     * @method module:nbt.Writer#int
     * @param {number} value - a signed 32-bit integer
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.int] = write.bind(null, 'Int32', 4);

    /**
     * @method module:nbt.Writer#long
     * @param {number} value - a signed 64-bit integer
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.long] = function(value) {
        // Ensure value is a 64-bit BigInt
        if (typeof value !== 'bigint') {
            throw new Error('Value must be a BigInt');
        }
        const hi = Number(value >> 32n) & 0xffffffff;
        const lo = Number(value & 0xffffffffn);
        self[nbt.tagTypes.int](hi);
        self[nbt.tagTypes.int](lo);
        return self;
    };

    /**
     * @method module:nbt.Writer#float
     * @param {number} value - a 32-bit IEEE 754 floating point number
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.float] = write.bind(null, 'Float32', 4);

    /**
     * @method module:nbt.Writer#double
     * @param {number} value - a 64-bit IEEE 754 floating point number
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.double] = write.bind(null, 'Float64', 8);

    /**
     * @method module:nbt.Writer#byteArray
     * @param {Uint8Array} value - an array of signed bytes
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.byteArray] = function(value) {
        self[nbt.tagTypes.int](value.length);
        accommodate(value.length);
        arrayView.set(value, self.offset);
        self.offset += value.length;
        return self;
    };

    /**
     * @method module:nbt.Writer#string
     * @param {string} value - an unprefixed UTF-8 string
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.string] = function(value) {
        const encoded = encodeUTF8(value);
        self[nbt.tagTypes.short](encoded.length);
        accommodate(encoded.length);
        arrayView.set(encoded, self.offset);
        self.offset += encoded.length;
        return self;
    };

    /**
     * @method module:nbt.Writer#list
     * @param {number} type - an NBT type number
     * @param {Array} value - an array of values of the given type
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.list] = function(type, value) {
        self[nbt.tagTypes.byte](type);
        self[nbt.tagTypes.int](value.length);
        value.forEach(function(element) {
            self[type](element);
        });
        return self;
    };

    /**
     * @method module:nbt.Writer#compound
     * @param {Object<string, any>} value - an object of key-value pairs
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.compound] = function(value) {
        Object.keys(value).forEach(function(key) {
            const elementType = value[key].type;
            self[nbt.tagTypes.byte](elementType);
            self[nbt.tagTypes.string](key);
            self[elementType](value[key].value);
        });
        self[nbt.tagTypes.byte](nbt.tagTypes.end);
        return self;
    };

    /**
     * @method module:nbt.Writer#intArray
     * @param {Int32Array} value - an array of signed 32-bit integers
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.intArray] = function(value) {
        self[nbt.tagTypes.int](value.length);
        for (let i = 0; i < value.length; i++) {
            self[nbt.tagTypes.int](value[i]);
        }
        return self;
    };

    /**
     * @method module:nbt.Writer#longArray
     * @param {BigInt64Array} value - an array of signed 64-bit integers
     * @returns {module:nbt.Writer} itself */
    this[nbt.tagTypes.longArray] = function(value) {
        self[nbt.tagTypes.int](value.length);
        for (let i = 0; i < value.length; i++) {
            self[nbt.tagTypes.long](value[i]);
        }
        return self;
    };

    // Alias the methods by NBT type number
    for (const type in nbt.tagTypes) {
        if (nbt.tagTypes.hasOwnProperty(type) && typeof this[nbt.tagTypes[type]] === 'function') {
            this[type] = this[nbt.tagTypes[type]];
        }
    }
};

/**
 * @param {ArrayBuffer} data - the NBT data to read
 * @constructor
 * @see module:nbt.Writer */
nbt.Reader = function(data) {
    const self = this;

    let buffer = data;

    /* These are recreated when the buffer is */
    let dataView = new DataView(buffer);
    let arrayView = new Uint8Array(buffer);

    /**
     * The location in the buffer where bytes are written or read.
     * This increases after every read, but can be freely changed.
     * The buffer will be resized when necessary.
     *
     * @type number */
    this.offset = 0;

    function read(dataType, size) {
        const value = dataView['get' + dataType](self.offset);
        self.offset += size;
        return value;
    }

    /**
     * @method module:nbt.Reader#byte
     * @returns {number} a signed byte */
    this[nbt.tagTypes.byte] = read.bind(null, 'Int8', 1);

    /**
     * @method module:nbt.Reader#short
     * @returns {number} a signed 16-bit integer */
    this[nbt.tagTypes.short] = read.bind(null, 'Int16', 2);

    /**
     * @method module:nbt.Reader#int
     * @returns {number} a signed 32-bit integer */
    this[nbt.tagTypes.int] = read.bind(null, 'Int32', 4);

    /**
     * @method module:nbt.Reader#long
     * @returns {bigint} a signed 64-bit integer */
    this[nbt.tagTypes.long] = function() {
        const hi = self[nbt.tagTypes.int]();
        const lo = self[nbt.tagTypes.int]();
        return BigInt(hi) << 32n | BigInt(lo);
    };

    /**
     * @method module:nbt.Reader#float
     * @returns {number} a 32-bit IEEE 754 floating point number */
    this[nbt.tagTypes.float] = read.bind(null, 'Float32', 4);

    /**
     * @method module:nbt.Reader#double
     * @returns {number} a 64-bit IEEE 754 floating point number */
    this[nbt.tagTypes.double] = read.bind(null, 'Float64', 8);

    /**
     * @method module:nbt.Reader#byteArray
     * @returns {Uint8Array} an array of signed bytes */
    this[nbt.tagTypes.byteArray] = function() {
        const length = self[nbt.tagTypes.int]();
        const value = sliceUint8Array(arrayView, self.offset, self.offset + length);
        self.offset += length;
        return value;
    };

    /**
     * @method module:nbt.Reader#string
     * @returns {string} an unprefixed UTF-8 string */
    this[nbt.tagTypes.string] = function() {
        const length = self[nbt.tagTypes.short]();
        const value = sliceUint8Array(arrayView, self.offset, self.offset + length);
        self.offset += length;
        return decodeUTF8(value);
    };

    /**
     * @method module:nbt.Reader#list
     * @returns {Array} an array of values of the given type */
    this[nbt.tagTypes.list] = function() {
        const type = self[nbt.tagTypes.byte]();
        const length = self[nbt.tagTypes.int]();
        const value = [];
        for (let i = 0; i < length; i++) {
            value.push(self[type]());
        }
        return value;
    };

    /**
     * @method module:nbt.Reader#compound
     * @returns {Object<string, any>} an object of key-value pairs */
    this[nbt.tagTypes.compound] = function() {
        const value = {};
        let type;
        while ((type = self[nbt.tagTypes.byte]()) !== nbt.tagTypes.end)

 {
            const key = self[nbt.tagTypes.string]();
            value[key] = { type, value: self[type]() };
        }
        return value;
    };

    /**
     * @method module:nbt.Reader#intArray
     * @returns {Int32Array} an array of signed 32-bit integers */
    this[nbt.tagTypes.intArray] = function() {
        const length = self[nbt.tagTypes.int]();
        const value = new Int32Array(length);
        for (let i = 0; i < length; i++) {
            value[i] = self[nbt.tagTypes.int]();
        }
        return value;
    };

    /**
     * @method module:nbt.Reader#longArray
     * @returns {BigInt64Array} an array of signed 64-bit integers */
    this[nbt.tagTypes.longArray] = function() {
        const length = self[nbt.tagTypes.int]();
        const value = new BigInt64Array(length);
        for (let i = 0; i < length; i++) {
            value[i] = self[nbt.tagTypes.long]();
        }
        return value;
    };

    // Alias the methods by NBT type number
    for (const type in nbt.tagTypes) {
        if (nbt.tagTypes.hasOwnProperty(type) && typeof this[nbt.tagTypes[type]] === 'function') {
            this[type] = this[nbt.tagTypes[type]];
        }
    }
};

export default nbt;

type NbtTagTypes = {
    end: number;
    byte: number;
    short: number;
    int: number;
    long: number;
    float: number;
    double: number;
    byteArray: number;
    string: number;
    list: number;
    compound: number;
    intArray: number;
    longArray: number;
};

class NbtWriter {
    offset: number;
    buffer: ArrayBuffer;
    arrayView: Uint8Array;
    dataView: DataView;

    constructor(data?: ArrayBuffer) {
        this.offset = 0;
        this.buffer = data || new ArrayBuffer(1024);
        this.arrayView = new Uint8Array(this.buffer);
        this.dataView = new DataView(this.buffer);
    }

    accommodate(size: number): void {
        if (this.buffer.byteLength - this.offset < size) {
            const newBuffer = new ArrayBuffer(this.buffer.byteLength * 2 + size);
            new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
            this.buffer = newBuffer;
            this.arrayView = new Uint8Array(this.buffer);
            this.dataView = new DataView(this.buffer);
        }
    }

    write(dataType: string, size: number, value: number | bigint): void {
        this.accommodate(size);
        (this.dataView as any)[`set${dataType}`](this.offset, value);
        this.offset += size;
    }

    byte(value: number): NbtWriter {
        this.write('Int8', 1, value);
        return this;
    }

    short(value: number): NbtWriter {
        this.write('Int16', 2, value);
        return this;
    }

    int(value: number): NbtWriter {
        this.write('Int32', 4, value);
        return this;
    }

    long(value: bigint): NbtWriter {
        if (typeof value !== 'bigint') {
            throw new Error('Value must be a BigInt');
        }
        const hi = Number(value >> 32n) & 0xffffffff;
        const lo = Number(value & 0xffffffffn);
        this.int(hi);
        this.int(lo);
        return this;
    }

    float(value: number): NbtWriter {
        this.write('Float32', 4, value);
        return this;
    }

    double(value: number): NbtWriter {
        this.write('Float64', 8, value);
        return this;
    }

    byteArray(value: Uint8Array): NbtWriter {
        this.int(value.length);
        this.accommodate(value.length);
        this.arrayView.set(value, this.offset);
        this.offset += value.length;
        return this;
    }

    string(value: string): NbtWriter {
        const encoded = new TextEncoder().encode(value);
        this.short(encoded.length);
        this.accommodate(encoded.length);
        this.arrayView.set(encoded, this.offset);
        this.offset += encoded.length;
        return this;
    }

    list(type: number, value: any[]): NbtWriter {
        this.byte(type);
        this.int(value.length);
        value.forEach((element) => {
            (this as any)[type](element);
        });
        return this;
    }

    compound(value: Record<string, { type: number; value: any }>): NbtWriter {
        Object.keys(value).forEach((key) => {
            const elementType = value[key].type;
            this.byte(elementType);
            this.string(key);
            (this as any)[elementType](value[key].value);
        });
        this.byte(nbt.tagTypes.end);
        return this;
    }

    intArray(value: Int32Array): NbtWriter {
        this.int(value.length);
        for (let i = 0; i < value.length; i++) {
            this.int(value[i]);
        }
        return this;
    }

    longArray(value: BigInt64Array): NbtWriter {
        this.int(value.length);
        for (let i = 0; i < value.length; i++) {
            this.long(value[i]);
        }
        return this;
    }
}

class NbtReader {
    offset: number;
    buffer: ArrayBuffer;
    dataView: DataView;
    arrayView: Uint8Array;

    constructor(data: ArrayBuffer) {
        this.offset = 0;
        this.buffer = data;
        this.dataView = new DataView(data);
        this.arrayView = new Uint8Array(data);
    }

    read(dataType: string, size: number): number | bigint {
        const value = (this.dataView as any)[`get${dataType}`](this.offset);
        this.offset += size;
        return value;
    }

    byte(): number {
        return this.read('Int8', 1) as number;
    }

    short(): number {
        return this.read('Int16', 2) as number;
    }

    int(): number {
        return this.read('Int32', 4) as number;
    }

    long(): bigint {
        const hi = this.int();
        const lo = this.int();
        return BigInt(hi) << 32n | BigInt(lo);
    }

    float(): number {
        return this.read('Float32', 4) as number;
    }

    double(): number {
        return this.read('Float64', 8) as number;
    }

    byteArray(): Uint8Array {
        const length = this.int();
        const value = this.arrayView.slice(this.offset, this.offset + length);
        this.offset += length;
        return value;
    }

    string(): string {
        const length = this.short();
        const value = this.arrayView.slice(this.offset, this.offset + length);
        this.offset += length;
        return new TextDecoder().decode(value);
    }

    list(): any[] {
        const type = this.byte();
        const length = this.int();
        const value: any[] = [];
        for (let i = 0; i < length; i++) {
            value.push((this as any)[type]());
        }
        return value;
    }

    compound(): Record<string, { type: number; value: any }> {
        const value: Record<string, { type: number; value: any }> = {};
        let type;
        while ((type = this.byte()) !== nbt.tagTypes.end) {
            const key = this.string();
            value[key] = { type, value: (this as any)[type]() };
        }
        return value;
    }

    intArray(): Int32Array {
        const length = this.int();
        const value = new Int32Array(length);
        for (let i = 0; i < length; i++) {
            value[i] = this.int();
        }
        return value;
    }

    longArray(): BigInt64Array {
        const length = this.int();
        const value = new BigInt64Array(length);
        for (let i = 0; i < length; i++) {
            value[i] = this.long();
        }
        return value;
    }
}

export { NbtWriter, NbtReader, nbt };