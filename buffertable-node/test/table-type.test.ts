import test from 'ava';

(async () => {
  const { BufferTable, BType } = await (process.env.NODE_ENV === 'test-web'
    ? import('../src/node')
    : import('../src/node'));

  test('create, add row, and get row with table type returns correct value', t => {
    const tb1 = BufferTable.create([
      BType.I32,
      BType.BOOL,
      BType.I32,
      BType.STR,
      BType.TABLE
    ]);

    const tb2 = BufferTable.create([BType.I8, BType.STR, BType.I8, BType.BOOL]);
    tb2.addRow([1, 'Sam', 27, true]);
    tb2.addRow([2, 'Som', 16, false]);

    tb1.addRow([100, true, 50, 'John', tb2]);
    t.deepEqual(tb1.getRow(0), [100, true, 50, 'John', tb2]);
  });

  test('getBuffer and create table from buffer with table type', t => {
    const tb1 = BufferTable.create([
      BType.I32,
      BType.BOOL,
      BType.I32,
      BType.STR,
      BType.TABLE
    ]);

    const tb2 = BufferTable.create([BType.I8, BType.STR, BType.I8, BType.BOOL]);
    tb2.addRow([1, 'Sam', 27, true]);
    tb2.addRow([2, 'Som', 16, false]);

    tb1.addRow([100, true, 50, 'John', tb2]);

    const buffer = tb1.getBuffer();
    const tb3 = BufferTable.from(buffer);

    t.deepEqual(tb1.unpack(), tb3.unpack());
  });
})();
