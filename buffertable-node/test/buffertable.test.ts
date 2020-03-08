import { bool } from '../src/btype';
import { BufferTable } from '../src/buffertable';
import test from 'ava';
import { i32 } from '../src/btype';

test('create, add row, and get row return correct value', t => {
  const table = BufferTable.create([i32, bool, i32]);

  table.addRow([100, true, 50]);
  t.deepEqual(table.getRow(0), [100, true, 50]);

  table.addRow([44, false, 1000]);
  t.deepEqual(table.getRow(1), [44, false, 1000]);
});

test('row count', t => {
  const table = BufferTable.create([i32, bool, i32]);

  table.addRow([100, true, 50]);
  table.addRow([100, true, 50]);
  table.addRow([100, true, 50]);

  t.is(table.getRowCount(), 3);

  table.addRow([100, true, 50]);

  t.is(table.getRowCount(), 4);
});

test('set data and get data', t => {
  const table = BufferTable.create([i32, bool, i32]);

  table.addRow([100, true, 50]);
  table.addRow([45, false, 150]);
  table.addRow([20, true, 500]);

  table
    .setData(0, 2, 430)
    .setData(2, 0, 330)
    .setData(2, 1, false)
    .setData(1, 2, 7500);

  t.is(table.getData(0, 0), 100);
  t.is(table.getData(0, 1), true);
  t.is(table.getData(0, 2), 430);
  t.is(table.getData(1, 0), 45);
  t.is(table.getData(1, 1), false);
  t.is(table.getData(1, 2), 7500);
  t.is(table.getData(2, 0), 330);
  t.is(table.getData(2, 1), false);
  t.is(table.getData(2, 2), 500);
});

test('delete row', t => {
  const table = BufferTable.create([i32, bool, i32]);

  table
    .addRow([100, true, 50])
    .addRow([45, false, 150])
    .addRow([20, true, 500])
    .addRow([10, true, 2500])
    .addRow([240, false, 320]);

  table.deleteRow(0);
  table.deleteRow(1);

  t.is(table.getRowCount(), 3);
  t.deepEqual(table.getRow(0), [45, false, 150]);
  t.deepEqual(table.getRow(1), [10, true, 2500]);
});

test('unpack', t => {
  const table = BufferTable.create([i32, bool, i32]);

  table
    .addRow([100, true, 50])
    .addRow([45, false, 150])
    .addRow([20, true, 500]);

  t.deepEqual(table.unpack(), [
    [100, true, 50],
    [45, false, 150],
    [20, true, 500]
  ]);
});

test('getBuffer and create table from buffer', t => {
  const schema = [i32, bool, i32];

  const table = BufferTable.create(schema);

  table.addRow([100, true, 50]);

  const buffer = table.getBuffer();
  const table2 = BufferTable.from(buffer);

  t.deepEqual(table.unpack(), table2.unpack());
});
