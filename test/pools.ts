import assert from 'assert';

import { IPPool } from '../src/IPPool';
import { IPRange } from '../src/IPRange';
import { IPv4Addr } from '../src/IPv4Addr';

const pool = new IPPool()
    .append(IPRange.parseCIDR('192.168.1.0/24'))
    .append(IPRange.parseCIDR('192.168.2.0/24'));

assert(pool.getRanges().length === 2);
assert(pool.containsAddr(IPv4Addr.parse('192.168.1.233')));
assert(pool.containsRange(IPRange.parse('192.168.1.233-192.168.2.233')));
assert(!pool.containsAddr(IPv4Addr.parse('192.168.3.233')));
assert(!pool.containsRange(IPRange.parse('192.168.1.233-192.168.3.233')));

const poolAggregated = pool.aggregate();
assert(poolAggregated.getRanges().length === 1);
assert(poolAggregated.containsAddr(IPv4Addr.parse('192.168.1.233')));
assert(poolAggregated.containsRange(IPRange.parse('192.168.1.233-192.168.2.233')));
assert(!poolAggregated.containsAddr(IPv4Addr.parse('192.168.3.233')));
assert(!poolAggregated.containsRange(IPRange.parse('192.168.1.233-192.168.3.233')));

const poolSubtractedAtMiddle = pool.subtract(IPRange.parse('192.168.1.128-192.168.2.127')).aggregate();
assert(poolSubtractedAtMiddle.getRanges().length === 2);
assert(poolSubtractedAtMiddle.containsRange(IPRange.parse('192.168.1.0-192.168.1.127')));
assert(poolSubtractedAtMiddle.containsRange(IPRange.parse('192.168.2.128-192.168.2.255')));
assert(!poolSubtractedAtMiddle.containsAddr(IPv4Addr.parse('192.168.1.233')));
assert(!poolSubtractedAtMiddle.containsRange(IPRange.parse('192.168.1.233-192.168.2.233')));

const poolSubtractedAtEnd = pool.subtract(IPRange.parse('192.168.1.128-192.168.3.127')).aggregate();
assert(poolSubtractedAtEnd.getRanges().length === 1);
assert(poolSubtractedAtEnd.containsRange(IPRange.parse('192.168.1.0-192.168.1.127')));
assert(!poolSubtractedAtEnd.containsRange(IPRange.parse('192.168.2.128-192.168.2.255')));
