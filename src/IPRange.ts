import { IPAddr } from './IPAddr';
import { IPv4Addr } from './IPv4Addr';
import { IPv6Addr } from './IPv6Addr';

// Inclusive on both ends.
// Should be immutable.
export class IPRange<T extends IPAddr<T>> {
    static parse(s: string, sep: string | RegExp = '-'): IPRange<IPv4Addr | IPv6Addr> {
        const [start, end, ...rest] = s.split(sep);
        if (rest.length > 0) {
            throw new Error('Invalid IP range string');
        }

        if (start.includes(':')) {
            return new IPRange(IPv6Addr.parse(start), IPv6Addr.parse(end));
        } else {
            return new IPRange(IPv4Addr.parse(start), IPv4Addr.parse(end));
        }
    }

    static parseCIDR(s: string): IPRange<IPv4Addr | IPv6Addr> {
        const [addr, len, ...rest] = s.split('/');
        if (rest.length > 0) {
            throw new Error('Invalid CIDR string');
        }

        if (addr.includes(':')) {
            const addrInt = IPv6Addr.parse(addr).toInt();
            const maskInt = IPv6Addr.netMask(len).toInt();

            const start = new IPv6Addr(addrInt.and(maskInt));
            const end = new IPv6Addr(addrInt.or(maskInt.not()));

            return new IPRange(start, end);
        } else {
            const addrInt = IPv4Addr.parse(addr).toInt();
            const maskInt = IPv4Addr.netMask(len).toInt();

            const start = new IPv4Addr(addrInt.and(maskInt));
            const end = new IPv4Addr(addrInt.or(maskInt.not()));

            return new IPRange(start, end);
        }
    }

    protected start: T;
    protected end: T;

    constructor(start: T, end: T) {
        if (start.gt(end)) {
            throw new Error('Start address is greater than end address');
        }

        if (!start.isSameType(end)) {
            throw new Error('Start and end addresses are of different types');
        }

        this.start = start;
        this.end = end;
    }

    getStart() {
        return this.start;
    }

    getEnd() {
        return this.end;
    }

    withStart(start: T) {
        if (start.gt(this.end)) {
            throw new Error('The new start address is greater than end address');
        }

        return new IPRange(start, this.end);
    }

    withEnd(end: T) {
        if (end.lt(this.start)) {
            throw new Error('The new end address is less than start address');
        }

        return new IPRange(this.start, end);
    }

    capacity() {
        return this.end.toInt().subtract(this.start.toInt()).add(1);
    }

    containsAddr(addr: T) {
        if (!addr.isSameType(this.start)) {
            return false;
        }

        return this.start.lte(addr) && this.end.gte(addr);
    }

    containsRange(other: IPRange<T>) {
        if (!other.start.isSameType(this.start)) {
            return false;
        }

        return this.start.lte(other.start) && this.end.gte(other.end);
    }

    equals(other: IPRange<T>) {
        if (!other.start.isSameType(this.start)) {
            return false;
        }

        return this.start.eq(other.start) && this.end.eq(other.end);
    }

    overlaps(other: IPRange<T>) {
        if (!other.start.isSameType(this.start)) {
            return false;
        }

        return this.start.lte(other.end) && this.end.gte(other.start);
    }

    adjacentTo(other: IPRange<T>) {
        if (!other.start.isSameType(this.start)) {
            return false;
        }

        return (this.end.next()?.eq(other.start) ?? false)
            || (this.start.prev()?.eq(other.end) ?? false);
    }

    mergableWith(other: IPRange<T>) {
        return this.overlaps(other) || this.adjacentTo(other);
    }

    merge(other: IPRange<T>) {
        if (!this.mergableWith(other)) {
            throw new Error('Cannot merge disjoint ranges');
        }

        return new IPRange(
            this.start.lt(other.start) ? this.start : other.start,
            this.end.gt(other.end) ? this.end : other.end,
        );
    }

    subtract(other: IPRange<T>) {
        if (!other.overlaps(this)) {
            return [this];
        }

        const remaining: IPRange<T>[] = [];

        if (this.getStart().lt(other.getStart())) {
            remaining.push(new IPRange(this.getStart(), other.getStart().prev()!));
        }

        if (this.getEnd().gt(other.getEnd())) {
            remaining.push(new IPRange(other.getEnd().next()!, this.getEnd()));
        }

        return remaining;
    }

    toString(sep = '-') {
        return `${this.start.toString()}${sep}${this.end.toString()}`;
    }
}
