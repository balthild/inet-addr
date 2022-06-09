import { BigInteger } from 'big-integer';

export abstract class IPAddr<T extends IPAddr<T>> {
    abstract newInstance(value: BigInteger): T;
    abstract isSameType(other: object): boolean;

    abstract isMin(): boolean;
    abstract isMax(): boolean;
    abstract toInt(): BigInteger;
    abstract toString(): string;

    prev(): T | null {
        return this.isMin() ? null : this.newInstance(this.toInt().prev());
    }

    next(): T | null {
        return this.isMax() ? null : this.newInstance(this.toInt().next());
    }

    compare(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().compare(other.toInt());
    }

    eq(other: IPAddr<any>): boolean {
        if (!this.isSameType(other)) {
            return false;
        }
        return this.toInt().equals(other.toInt());
    }

    neq(other: IPAddr<any>): boolean {
        if (!this.isSameType(other)) {
            return true;
        }
        return this.toInt().notEquals(other.toInt());
    }

    lt(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().lesser(other.toInt());
    }

    gt(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().greater(other.toInt());
    }

    lte(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().lesserOrEquals(other.toInt());
    }

    gte(other: T) {
        this.assertActionable(other, 'compare');
        return this.toInt().greaterOrEquals(other.toInt());
    }

    protected assertActionable(other: object, action: string): void {
        if (!this.isSameType(other)) {
            throw new Error(`Cannot ${action} ${this.constructor.name} with ${other.constructor.name}`);
        }
    }
}
