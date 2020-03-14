import test from 'ava';
import { nextPowerOf2 } from '../src/utils';

test('next nearest power of 2', t => {
  t.is(nextPowerOf2(65), 128);
  t.is(nextPowerOf2(63), 64);
  t.is(nextPowerOf2(64), 64);
  t.is(nextPowerOf2(0), 1);
  t.is(nextPowerOf2(1), 1);
  t.is(nextPowerOf2(-348284), 1);
});
