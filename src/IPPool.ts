import { IPAddr } from './IPAddr';
import { IPRange } from './IPRange';

export class IPPool<T extends IPAddr<T>> {
    protected ranges: IPRange<T>[];

    constructor(ranges: IPRange<T>[] = []) {
        this.ranges = [...ranges];
        this.ranges.sort((a, b) => a.getStart().compare(b.getStart()));
    }

    getRanges() {
        return this.ranges;
    }

    containsAddr(addr: T) {
        return this.ranges.some(range => range.containsAddr(addr));
    }

    containsRange(other: IPRange<T>) {
        let remaining = [other];

        for (const range of this.ranges) {
            remaining = remaining.flatMap((x) => x.subtract(range));

            if (remaining.length === 0) {
                return true;
            }
        }

        return false;
    }

    append(range: IPRange<T>) {
        return new IPPool<T>([...this.ranges, range]);
    }

    subtract(removing: IPRange<T>) {
        const ranges = this.ranges.flatMap((range) => range.subtract(removing));
        return new IPPool<T>(ranges);
    }

    aggregate() {
        if (this.ranges.length <= 1) {
            return this;
        }

        const [first, ...rest] = this.ranges;
        const aggregated = [first];

        for (const range of rest) {
            const lastIndex = aggregated.length - 1;
            const last = aggregated[lastIndex];

            if (last.mergableWith(range)) {
                aggregated[lastIndex] = last.merge(range);
            } else {
                aggregated.push(range);
            }
        }

        return new IPPool<T>(aggregated);
    }
}
