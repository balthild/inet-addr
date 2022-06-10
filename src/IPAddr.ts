import { BigInteger } from 'big-integer';

/**
 * An base class for IPv4 and IPv6 addresses.
 */
export abstract class IPAddr<T extends IPAddr<T>> {
    /**
     * Create a new instance of the address' class. This method is called by the base class most of the time.
     * @virtual
     * @param value The integer value of the address
     */
    abstract newInstance(value: BigInteger): T;

    /**
     * Determine if the given object is an instance of the address' class.
     * @param other
     */
    abstract isSameType(other: object): boolean;

    /**
     * Determine if the address is the minimum possible address.
     */
    abstract isMin(): boolean;

    /**
     * Determine if the address is the maximum possible address.
     */
    abstract isMax(): boolean;

    /**
     * Get the corresponding integer of the address.
     */
    abstract toInt(): BigInteger;

    /**
     * Get the string representation of the address.
     */
    abstract toString(): string;

    /**
     * Get the previous address of the address.
     */
    prev(): T | null {
        return this.isMin() ? null : this.newInstance(this.toInt().prev());
    }

    /**
     * Get the next address of the address.
     */
    next(): T | null {
        return this.isMax() ? null : this.newInstance(this.toInt().next());
    }

    /**
     * Performs a comparison between two addresses.
     *
     * If the two addresses are equal, returns 0.
     * If the address is greater than the parameter, returns 1.
     * If the address is less than the parameter, returns -1.
     * @returns 0, 1 or -1
     */
    compare(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().compare(other.toInt());
    }

    /**
     * Determine if the two addresses are equal.
     *
     * If the two addresses are in different type,
     * eg. one is `IPv4Addr` and another is `IPv6Addr`,
     * the function will always return `false`.
     */
    eq(other: IPAddr<any>): boolean {
        if (!this.isSameType(other)) {
            return false;
        }
        return this.toInt().equals(other.toInt());
    }

    /**
     * Determine if the two addresses are unequal.
     *
     * If the two addresses are in different type,
     * eg. one is `IPv4Addr` and another is `IPv6Addr`,
     * the function will always return `true`.
     */
    neq(other: IPAddr<any>): boolean {
        if (!this.isSameType(other)) {
            return true;
        }
        return this.toInt().notEquals(other.toInt());
    }

    /**
     * Determine if the address is less than the parameter.
     *
     * If the two addresses are in different type,
     * eg. one is `IPv4Addr` and another is `IPv6Addr`,
     * the function will throw an error.
     */
    lt(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().lesser(other.toInt());
    }

    /**
     * Determine if the address is greater than the parameter.
     *
     * If the two addresses are in different type,
     * eg. one is `IPv4Addr` and another is `IPv6Addr`,
     * the function will throw an error.
     */
    gt(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().greater(other.toInt());
    }

    /**
     * Determine if the address is less than or equal to the parameter.
     *
     * If the two addresses are in different type,
     * eg. one is `IPv4Addr` and another is `IPv6Addr`,
     * the function will throw an error.
     */
    lte(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().lesserOrEquals(other.toInt());
    }

    /**
     * Determine if the address is greater than or equal to the parameter.
     *
     * If the two addresses are in different type,
     * eg. one is `IPv4Addr` and another is `IPv6Addr`,
     * the function will throw an error.
     */
    gte(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().greaterOrEquals(other.toInt());
    }

    /**
     * @ignore
     */
    protected assertActionable(other: object, action: string): void {
        if (!this.isSameType(other)) {
            throw new Error(`Cannot ${action} ${this.constructor.name} with ${other.constructor.name}`);
        }
    }
}
