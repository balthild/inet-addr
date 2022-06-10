import assert from 'assert';

import { IPv4Addr } from '../src/IPv4Addr';

assert(IPv4Addr.parse('192.168.1.1').eq(IPv4Addr.parse('192.168.1.001')));
assert(IPv4Addr.parse('192.168.1.1').neq(IPv4Addr.parse('192.168.1.002')));

assert(IPv4Addr.netMask(0).eq(IPv4Addr.parse('0.0.0.0')));
assert(IPv4Addr.netMask(16).eq(IPv4Addr.parse('255.255.0.0')));
assert(IPv4Addr.netMask(32).eq(IPv4Addr.parse('255.255.255.255')));

assert(IPv4Addr.parse('192.168.1.1').lt(IPv4Addr.parse('192.168.1.2')));
assert(IPv4Addr.parse('192.168.1.1').lte(IPv4Addr.parse('192.168.1.2')));
assert(IPv4Addr.parse('192.168.1.1').lte(IPv4Addr.parse('192.168.1.1')));

assert(IPv4Addr.parse('192.168.1.2').gt(IPv4Addr.parse('192.168.1.1')));
assert(IPv4Addr.parse('192.168.1.2').gte(IPv4Addr.parse('192.168.1.1')));
assert(IPv4Addr.parse('192.168.1.2').gte(IPv4Addr.parse('192.168.1.2')));

assert(IPv4Addr.parse('192.168.000.001').toString() === '192.168.0.1');

assert.throws(() => IPv4Addr.parse('192.168.1.256'));
assert.throws(() => IPv4Addr.parse('192.168.1.-1'));
assert.throws(() => IPv4Addr.parse('192.168.1.CC'));
assert.throws(() => IPv4Addr.parse('2001::1'));
