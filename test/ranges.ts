import assert from 'assert';

import { IPRange } from '../src/IPRange';
import { IPv4Addr } from '../src/IPv4Addr';
import { IPv6Addr } from '../src/IPv6Addr';

const range = IPRange.parseCIDR('192.168.1.0/24');

assert(range.equals(IPRange.parse('192.168.1.0-192.168.1.255')));
assert(range.getStart().eq(IPv4Addr.parse('192.168.1.0')));
assert(range.getEnd().eq(IPv4Addr.parse('192.168.1.255')));
assert(range.capacity().toJSNumber() === 256);

assert(range.containsAddr(IPv4Addr.parse('192.168.1.233')));
assert(!range.containsAddr(IPv6Addr.parse('::FFFF:C0A8:0101')));

assert(range.overlaps(IPRange.parseCIDR('192.168.1.64/26')));
assert(range.overlaps(IPRange.parseCIDR('192.168.0.0/22')));
assert(range.overlaps(IPRange.parse('192.168.0.128-192.168.1.127')));
assert(range.overlaps(IPRange.parse('192.168.1.128-192.168.2.127')));
assert(!range.overlaps(IPRange.parseCIDR('::FFFF:C0A8:0100/24')));

assert(range.containsRange(IPRange.parseCIDR('192.168.1.64/26')));
assert(range.containsRange(IPRange.parseCIDR('192.168.1.0/24')));
assert(!range.containsRange(IPRange.parseCIDR('192.168.1.0/22')));
assert(!range.containsRange(IPRange.parse('192.168.0.128-192.168.1.127')));
assert(!range.containsRange(IPRange.parse('192.168.1.128-192.168.2.127')));
assert(!range.containsRange(IPRange.parseCIDR('::FFFF:C0A8:0100/24')));

assert(range.adjacentTo(IPRange.parseCIDR('192.168.2.0/24')));
assert(range.adjacentTo(IPRange.parseCIDR('192.168.0.128/25')));
assert(!range.adjacentTo(IPRange.parseCIDR('192.168.1.0/26')));
assert(!range.adjacentTo(IPRange.parseCIDR('192.168.1.0/22')));
assert(!range.adjacentTo(IPRange.parse('192.168.0.128-192.168.1.127')));
assert(!range.adjacentTo(IPRange.parse('192.168.1.128-192.168.2.127')));
assert(!range.adjacentTo(IPRange.parseCIDR('::FFFF:C0A8:0200/24')));

assert(range.merge(IPRange.parseCIDR('192.168.1.0/26')).equals(IPRange.parseCIDR('192.168.1.0/24')));
assert(range.merge(IPRange.parseCIDR('192.168.0.0/24')).equals(IPRange.parseCIDR('192.168.0.0/23')));
assert(range.merge(IPRange.parseCIDR('192.168.0.0/22')).equals(IPRange.parseCIDR('192.168.0.0/22')));
assert.throws(() => range.merge(IPRange.parseCIDR('::FFFF:C0A8:0000/24')));

const rangeSubtractedAtStart = range.subtract(IPRange.parseCIDR('192.168.1.0/26'));
assert(rangeSubtractedAtStart.length === 1);
assert(rangeSubtractedAtStart[0].equals(IPRange.parse('192.168.1.64-192.168.1.255')));

const rangeSubtractedAtEnd = range.subtract(IPRange.parseCIDR('192.168.1.192/26'));
assert(rangeSubtractedAtEnd.length === 1);
assert(rangeSubtractedAtEnd[0].equals(IPRange.parse('192.168.1.0-192.168.1.191')));

const rangeSubtractedAtMiddle = range.subtract(IPRange.parseCIDR('192.168.1.64/26'));
assert(rangeSubtractedAtMiddle.length === 2);
assert(rangeSubtractedAtMiddle[0].equals(IPRange.parse('192.168.1.0-192.168.1.63')));
assert(rangeSubtractedAtMiddle[1].equals(IPRange.parse('192.168.1.128-192.168.1.255')));

const rangeEmpty = range.subtract(IPRange.parseCIDR('192.168.1.0/24'));
assert(rangeEmpty.length === 0);

const rangeUnchanged = range.subtract(IPRange.parseCIDR('192.168.0.0/24'));
assert(rangeUnchanged.length === 1);
assert(rangeUnchanged[0].equals(range));
