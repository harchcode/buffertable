import test from 'ava';

(async () => {
  const { BufferTable, i8, i32, bool, str, table } = await import(
    process.env.NODE_ENV === 'test-web' ? '../src/web' : '../src/node'
  );

  test('create, add row, and get row with table type returns correct value', t => {
    const tb1 = BufferTable.create([i32, bool, i32, str, table]);

    const tb2 = BufferTable.create([i8, str, i8, bool]);
    tb2.addRow([1, 'Sam', 27, true]);
    tb2.addRow([2, 'Som', 16, false]);

    tb1.addRow([100, true, 50, 'John', tb2]);
    t.deepEqual(tb1.getRow(0), [100, true, 50, 'John', tb2]);
  });

  test('getBuffer and create table from buffer with table type', t => {
    const tb1 = BufferTable.create([i32, bool, i32, str, table]);

    const tb2 = BufferTable.create([i8, str, i8, bool]);
    tb2.addRow([1, 'Sam', 27, true]);
    tb2.addRow([2, 'Som', 16, false]);

    tb1.addRow([100, true, 50, 'John', tb2]);

    const buffer = tb1.getBuffer();
    const tb3 = BufferTable.from(buffer);

    t.deepEqual(tb1.unpack(), tb3.unpack());
  });
})();
