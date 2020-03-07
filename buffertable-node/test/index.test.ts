import { bool } from './../src/btype';
import { BufferTable } from './../src/buffertable';
import test from 'ava';
import { i32 } from '../src/btype';

test('add row and get row return correct value', t => {
  const table = BufferTable.create([i32, bool, i32]);

  table.addRow([100, true, 50]);
  t.deepEqual(table.getRow(0), [100, true, 50]);

  table.addRow([44, false, 1000]);
  t.deepEqual(table.getRow(1), [44, false, 1000]);
});
