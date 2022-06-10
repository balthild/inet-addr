import bigInt, { BigInteger } from 'big-integer';

import { IPAddr } from './IPAddr';

const IPv4_ADDR_PATTERN = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPv4_PREFIX_LEN_PATTERN = /^(?:[0-9]|[1-2][0-9]|3[0-2])$/;

const IPv4_INT_ALL_ONES = bigInt.one.shiftLeft(32).prev();

/**
 * The class represents an IPv4 address.
 */
export class IPv4Addr extends IPAddr<IPv4Addr> {
    /**
     * Parse an IPv4 address string and return an instance of `IPv4Addr`.
     *
     * If the parameter `s` is not a valid string representation of an IPv4 address,
     * the function will throw an error.
     */
    static parse(s: string) {
        if (!IPv4_ADDR_PATTERN.test(s)) {
            throw new Error(`Invalid IPv4 address: ${s}`);
        }

        const value = s.split('.').reduce((acc, x) => acc.shiftLeft(8).or(bigInt(x, 10)), bigInt.zero);

        return new IPv4Addr(value);
    }

    /**
     * Construct the subnet mask address corresonding to the given prefix length.
     *
     * If the `prefixLen` parameter is not a number between 0 and 32 (inclusive),
     * the function will throw an error.
     *
     * ```typescript
     * const mask = IPv4Addr.netMask(24);
     * assert(mask.toString() === '255.255.255.0');
     * ```
     */
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

    /**
     * @ignore
     */
    protected readonly value: BigInteger;

    /**
     * Construct an IPv4 address from the given integer value.
     */
    constructor(value: BigInteger) {
        super();
        this.value = value.and(IPv4_INT_ALL_ONES);
    }

    /**
     * @inheritdoc
     */
    newInstance(value: bigInt.BigInteger) {
        return new IPv4Addr(value);
    }

    /**
     * @inheritdoc
     */
    isSameType(other: object): boolean {
        return other instanceof IPv4Addr;
    }

    /**
     * @inheritdoc
     */
    isMin() {
        return this.value.eq(0);
    }

    /**
     * @inheritdoc
     */
    isMax(): boolean {
        return this.value.eq(IPv4_INT_ALL_ONES);
    }

    /**
     * @inheritdoc
     */
    toInt() {
        return this.value;
    }

    /**
     * @inheritdoc
     */
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
