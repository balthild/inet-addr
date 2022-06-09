import bigInt, { BigInteger } from 'big-integer';

import { IPAddr } from './IPAddr';

const IPv4_ADDR_PATTERN = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPv4_PREFIX_LEN_PATTERN = /^(?:[0-9]|[1-2][0-9]|3[0-2])$/;

const IPv4_INT_ALL_ONES = bigInt.one.shiftLeft(32).prev();

export class IPv4Addr extends IPAddr<IPv4Addr> {
    static parse(s: string) {
        if (!IPv4_ADDR_PATTERN.test(s)) {
            throw new Error(`Invalid IPv4 address: ${s}`);
        }

        const value = s.split('.').reduce((acc, x) => acc.shiftLeft(8).or(bigInt(x, 10)), bigInt.zero);

        return new IPv4Addr(value);
    }

    static netMask(prefixLen: number | string) {
        if (typeof prefixLen === 'string') {
            if (!IPv4_PREFIX_LEN_PATTERN.test(prefixLen)) {
                throw new Error(`Invalid IPv4 prefix length: ${prefixLen}`);
            }
            prefixLen = parseInt(prefixLen, 10);
        }

        if (typeof prefixLen !== 'number' || prefixLen < 0 || prefixLen > 32) {
            throw new Error(`Invalid IPv4 prefix length: ${prefixLen}`);
        }

        const mask = IPv4_INT_ALL_ONES.shiftLeft(32 - prefixLen);

        return new IPv4Addr(mask);
    }

    protected readonly value: BigInteger;

    constructor(value: BigInteger) {
        super();
        this.value = value.and(IPv4_INT_ALL_ONES);
    }

    newInstance(value: bigInt.BigInteger) {
        return new IPv4Addr(value);
    }

    isSameType(other: object): boolean {
        return other instanceof IPv4Addr;
    }

    isMin() {
        return this.value.eq(0);
    }

    isMax(): boolean {
        return this.value.eq(IPv4_INT_ALL_ONES);
    }

    toInt() {
        return this.value;
    }

    toString() {
        const parts: string[] = [];

        let step = this.value;
        for (let i = 3; i >= 0; i--) {
            parts[i] = step.and(0xFF).toString();
            step = step.shiftRight(8);
        }

        return parts.join('.');
    }
}
