import assert from 'assert';

import { IPv4Addr } from '../src/IPv4Addr';
import { IPv6Addr } from '../src/IPv6Addr';

assert(IPv6Addr.parse('2001::1').eq(IPv6Addr.parse('2001:0:0:0:0:0:0:1')));
assert(IPv6Addr.parse('2001::1').neq(IPv6Addr.parse('2001:0:0:0:0:0:0:2')));
assert(IPv6Addr.parse('::1').eq(IPv6Addr.parse('0:0:0:0:0:0:0:1')));
assert(IPv6Addr.parse('::').eq(IPv6Addr.parse('0:0:0:0:0:0:0:0')));

assert(IPv6Addr.parse('2001::1').lt(IPv6Addr.parse('2001::2')));
assert(IPv6Addr.parse('2001::1').lte(IPv6Addr.parse('2001::2')));
assert(IPv6Addr.parse('2001::1').lte(IPv6Addr.parse('2001::1')));

assert(IPv6Addr.parse('2001::2').gt(IPv6Addr.parse('2001::1')));
assert(IPv6Addr.parse('2001::2').gte(IPv6Addr.parse('2001::1')));
assert(IPv6Addr.parse('2001::2').gte(IPv6Addr.parse('2001::2')));

assert(IPv6Addr.parse('2001::1').toString() === '2001::1');
assert(IPv6Addr.parse('2001:0:0:1:0:0:0:1').toString() === '2001:0:0:1::1');
assert(IPv6Addr.parse('2001::AB:CD:EF').toString() === '2001::ab:cd:ef');
assert(IPv6Addr.parse('2001::1').toString(true) === '2001:0000:0000:0000:0000:0000:0000:0001');

assert.throws(() => IPv6Addr.parse('2001:1'));
assert.throws(() => IPv6Addr.parse(':1:'));
assert.throws(() => IPv6Addr.parse('2001::000FFF'));
assert.throws(() => IPv6Addr.parse('2001::0:0::1'));
assert.throws(() => IPv6Addr.parse('2001:::1'));
assert.throws(() => IPv6Addr.parse('2001:0:0:1'));
assert.throws(() => IPv6Addr.parse('2001'));

// Different type of addresses are always unequal.
// IPv4-mapped IPv6 addresses are not supported currently.
assert(IPv4Addr.parse('192.168.1.1').neq(IPv6Addr.parse('::C0:A8:1:1') as any));
assert(IPv4Addr.parse('192.168.1.1').neq(IPv6Addr.parse('::C0A8:0101') as any));
assert(IPv4Addr.parse('192.168.1.1').neq(IPv6Addr.parse('::FFFF:C0A8:0101') as any));
