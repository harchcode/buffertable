import { BufferTable, i32, bool, str } from '../src';
import test from 'ava';

test('create, add row, and get row return correct value', t => {
  const table = BufferTable.create([i32, bool, i32, str]);

  table.addRow([100, true, 50, 'John']);
  t.deepEqual(table.getRow(0), [100, true, 50, 'John']);

  table.addRow([44, false, 1000, 'Hello world']);
  t.deepEqual(table.getRow(1), [44, false, 1000, 'Hello world']);
});

test('row count', t => {
  const table = BufferTable.create([i32, bool, i32, str]);

  table.addRow([100, true, 50, 'John']);
  table.addRow([100, true, 50, 'John']);
  table.addRow([100, true, 50, 'John']);

  t.is(table.getRowCount(), 3);

  table.addRow([100, true, 50, 'John']);

  t.is(table.getRowCount(), 4);
});

test('set data and get data', t => {
  const table = BufferTable.create([i32, bool, i32, str]);

  table.addRow([100, true, 50, 'John']);
  table.addRow([45, false, 150, 'Hello']);
  table.addRow([20, true, 500, 'Doe']);

  table
    .setData(0, 2, 430)
    .setData(2, 0, 330)
    .setData(2, 1, false)
    .setData(1, 3, 'Edited')
    .setData(1, 2, 7500);

  t.is(table.getData(0, 0), 100);
  t.is(table.getData(0, 1), true);
  t.is(table.getData(0, 2), 430);
  t.is(table.getData(0, 3), 'John');
  t.is(table.getData(1, 0), 45);
  t.is(table.getData(1, 1), false);
  t.is(table.getData(1, 2), 7500);
  t.is(table.getData(1, 3), 'Edited');
  t.is(table.getData(2, 0), 330);
  t.is(table.getData(2, 1), false);
  t.is(table.getData(2, 2), 500);
  t.is(table.getData(2, 3), 'Doe');
});

test('delete row', t => {
  const table = BufferTable.create([i32, bool, i32, str]);

  table
    .addRow([100, true, 50, 'John'])
    .addRow([45, false, 150, 'Hello'])
    .addRow([20, true, 500, 'Doe'])
    .addRow([10, true, 2500, 'Happy new year'])
    .addRow([240, false, 320, 'Jane']);

  table.deleteRow(0);
  table.deleteRow(1);

  t.is(table.getRowCount(), 3);
  t.deepEqual(table.getRow(0), [45, false, 150, 'Hello']);
  t.deepEqual(table.getRow(1), [10, true, 2500, 'Happy new year']);
});

test('unpack', t => {
  const table = BufferTable.create([i32, bool, i32, str]);

  table
    .addRow([100, true, 50, 'John'])
    .addRow([45, false, 150, 'Hello'])
    .addRow([20, true, 500, 'Doe']);

  t.deepEqual(table.unpack(), [
    [100, true, 50, 'John'],
    [45, false, 150, 'Hello'],
    [20, true, 500, 'Doe']
  ]);
});

test('getBuffer and create table from buffer', t => {
  const schema = [i32, bool, i32, str];

  const table = BufferTable.create(schema);

  table.addRow([100, true, 50, 'John']);

  const buffer = table.getBuffer();

  const table2 = BufferTable.from(buffer);

  t.deepEqual(table.unpack(), table2.unpack());
});