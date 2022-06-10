import bigInt, { BigInteger } from 'big-integer';

import { IPAddr } from './IPAddr';

const IPv6_ADDR_PART_PATTERN = /^[0-9a-fA-F]{1,4}$/;
const IPv6_PREFIX_LEN_PATTERN = /^(?:[0-9]|[1-9][0-9]|1[01][0-9]|12[0-8])$/;

const IPv6_INT_ALL_ONES = bigInt.one.shiftLeft(128).prev();

export class IPv6Addr extends IPAddr<IPv6Addr> {
    static parse(s: string) {
        let parts: string[];

        if (s.includes('::')) {
            let [left, right, ...rest] = s.split('::');
            if (rest.length !== 0) {
                throw new Error(`Invalid IPv6 address: ${s}`);
            }

            const leftParts = left === '' ? ['0'] : left.split(':');
            const rightParts = right === '' ? ['0'] : right.split(':');

            const zeroPartsCount = 8 - leftParts.length - rightParts.length;
            if (zeroPartsCount < 0) {
                throw new Error(`Invalid IPv6 address: ${s}`);
            }

            const zeroParts = new Array(zeroPartsCount).fill('0');

            parts = [...leftParts, ...zeroParts, ...rightParts];
        } else {
            parts = s.split(':');
            if (parts.length !== 8) {
                throw new Error(`Invalid IPv6 address: ${s}`);
            }
        }

        if (!parts.every(x => IPv6_ADDR_PART_PATTERN.test(x))) {
            throw new Error(`Invalid IPv6 address: ${s}`);
        }

        const value = parts.reduce((acc, x) => acc.shiftLeft(16).or(bigInt(x, 16)), bigInt.zero);

        return new IPv6Addr(value);
    }

    static netMask(prefixLen: number | string) {
        if (typeof prefixLen === 'string') {
            if (!IPv6_PREFIX_LEN_PATTERN.test(prefixLen)) {
                throw new Error(`Invalid IPv6 prefix length: ${prefixLen}`);
            }
            prefixLen = parseInt(prefixLen, 10);
        }

        if (typeof prefixLen !== 'number' || prefixLen < 0 || prefixLen > 128) {
            throw new Error(`Invalid IPv6 prefix length: ${prefixLen}`);
        }

        const mask = IPv6_INT_ALL_ONES.shiftLeft(128 - prefixLen);

        return new IPv6Addr(mask);
    }

    protected readonly value: BigInteger;

    constructor(value: BigInteger) {
        super();
        this.value = value.and(IPv6_INT_ALL_ONES);
    }

    newInstance(value: bigInt.BigInteger) {
        return new IPv6Addr(value);
    }

    isSameType(other: object): boolean {
        return other instanceof IPv6Addr;
    }

    assertSameType(other: object): void {
        if (!this.isSameType(other)) {
            throw new Error(`${other} is not an instance of IPv6Addr`);
        }
    }

    isMin() {
        return this.value.eq(0);
    }

    isMax(): boolean {
        return this.value.eq(IPv6_INT_ALL_ONES);
    }

    toInt() {
        return this.value;
    }

    toString(long = false) {
        const parts: string[] = [];

        let step = this.value;
        for (let i = 7; i >= 0; i--) {
            parts[i] = step.and(0xFFFF).toString(16, '0123456789abcdef');
            step = step.shiftRight(16);
        }

        if (long) {
            return parts.map(x => x.padStart(4, '0')).join(':');
        }

        // Find consecutive zero parts
        // [pos, count]
        const zeroParts: [number, number][] = [];

        for (let i = 0; i < 8; i++) {
            if (parts[i] !== '0') {
                // RFC 5952 4.2.2. Do not compress non-consecutive zero parts
                const lastZeroPart = zeroParts[zeroParts.length - 1];
                if (lastZeroPart && lastZeroPart[1] <= 1) {
                    zeroParts.pop();
                }

                continue;
            }

            // Don't need to check if i > 0, because array[-1] === undefined
            if (parts[i - 1] !== '0') {
                // Start of zero parts
                zeroParts.push([i, 1]);
            } else {
                // Continuation of zero parts
                zeroParts[zeroParts.length - 1][1]++;
            }
        }

        if (zeroParts.length === 0) {
            // Don't need to compress zero parts
            return parts.join(':');
        }

        // RFC 5952 4.2.3. Compress the consecutive zero part that is longest and appears earlier
        const [pos, count] = zeroParts.reduce((a, b) => a[1] >= b[1] ? a : b);

        const left = parts.slice(0, pos).join(':');
        const right = parts.slice(pos + count).join(':');

        return `${left}::${right}`;
    }
}
