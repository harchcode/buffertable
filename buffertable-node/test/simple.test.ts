import { BufferTable, i32, bool, str } from '../src';
import test from 'ava';

test('create, add row, and get row return correct value', t => {
  const res = BufferTable.create([i32, bool, i32, str]);

  res.addRow([100, true, 50, 'John']);
  t.deepEqual(res.getRow(0), [100, true, 50, 'John']);

  res.addRow([44, false, 1000, 'Hello world']);
  t.deepEqual(res.getRow(1), [44, false, 1000, 'Hello world']);
});

test('row count', t => {
  const res = BufferTable.create([i32, bool, i32, str]);

  res.addRow([100, true, 50, 'John']);
  res.addRow([100, true, 50, 'John']);
  res.addRow([100, true, 50, 'John']);

  t.is(res.getRowCount(), 3);

  res.addRow([100, true, 50, 'John']);

  t.is(res.getRowCount(), 4);
});

test('set data and get data', t => {
  const res = BufferTable.create([i32, bool, i32, str]);

  res.addRow([100, true, 50, 'John']);
  res.addRow([45, false, 150, 'Hello']);
  res.addRow([20, true, 500, 'Doe']);

  res
    .setData(0, 2, 430)
    .setData(2, 0, 330)
    .setData(2, 1, false)
    .setData(1, 3, 'Edited')
    .setData(1, 2, 7500);

  t.is(res.getData(0, 0), 100);
  t.is(res.getData(0, 1), true);
  t.is(res.getData(0, 2), 430);
  t.is(res.getData(0, 3), 'John');
  t.is(res.getData(1, 0), 45);
  t.is(res.getData(1, 1), false);
  t.is(res.getData(1, 2), 7500);
  t.is(res.getData(1, 3), 'Edited');
  t.is(res.getData(2, 0), 330);
  t.is(res.getData(2, 1), false);
  t.is(res.getData(2, 2), 500);
  t.is(res.getData(2, 3), 'Doe');
});

test('delete row', t => {
  const res = BufferTable.create([i32, bool, i32, str]);

  res
    .addRow([100, true, 50, 'John'])
    .addRow([45, false, 150, 'Hello'])
    .addRow([20, true, 500, 'Doe'])
    .addRow([10, true, 2500, 'Happy new year'])
    .addRow([240, false, 320, 'Jane']);

  res.deleteRow(0);
  res.deleteRow(1);

  t.is(res.getRowCount(), 3);
  t.deepEqual(res.getRow(0), [45, false, 150, 'Hello']);
  t.deepEqual(res.getRow(1), [10, true, 2500, 'Happy new year']);
});

test('unpack', t => {
  const res = BufferTable.create([i32, bool, i32, str]);

  res
    .addRow([100, true, 50, 'John'])
    .addRow([45, false, 150, 'Hello'])
    .addRow([20, true, 500, 'Doe']);

  t.deepEqual(res.unpack(), [
    [100, true, 50, 'John'],
    [45, false, 150, 'Hello'],
    [20, true, 500, 'Doe']
  ]);
});

test('getBuffer and create table from buffer', t => {
  const schema = [i32, bool, i32, str];

  const res = BufferTable.create(schema);

  res.addRow([100, true, 50, 'John']);

  const buffer = res.getBuffer();

  const res2 = BufferTable.from(buffer);

  t.deepEqual(res.unpack(), res2.unpack());
});
