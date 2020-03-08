import { BType, BValue, str, u32 } from './btype';
import { nextPowerOf2 } from './utils';

export class BufferTable {
  private tableBuffer: Buffer;
  private rowSize = 0;
  private rowStrCount = 0;
  private colOffsets: number[] = [];
  private strBuffers: Buffer[] = [];
  private schema: BType[] = [];
  private tableOffset = u32.size;

  private constructor(schema: BType[]) {
    this.schema = schema;
    let colOffset = 0;

    schema.forEach(type => {
      this.rowSize += type.size;
      this.colOffsets.push(colOffset);

      if (type === str) this.rowStrCount++;

      colOffset += type.size;
    });
  }

  private getTableSize(): number {
    return u32.read(this.tableBuffer, 0)[0] as number;
  }

  private setTableSize(value: number) {
    u32.write(this.tableBuffer, 0, value);

    return this;
  }

  private resizeBuffer(neededSize: number) {
    const size = this.tableBuffer.byteLength - u32.size;

    if (size >= neededSize && size < neededSize * 2) return this;

    const newSize = nextPowerOf2(neededSize) + u32.size;

    const newBuffer = Buffer.allocUnsafe(newSize);

    if (size < neededSize) {
      newBuffer.set(this.tableBuffer, 0);
    } else {
      newBuffer.set(this.tableBuffer.slice(0, neededSize + u32.size), 0);
    }

    this.tableBuffer = newBuffer;
  }

  addRow(rowData: BValue[]): BufferTable {
    const tableSize = this.getTableSize();
    const newSize = tableSize + this.rowSize;

    let offset = tableSize + this.tableOffset;
    let strOffset = 0;

    this.resizeBuffer(newSize);
    this.setTableSize(newSize);

    this.schema.forEach((type, i) => {
      if (type !== str) {
        offset += type.write(this.tableBuffer, offset, rowData[i]);
      } else {
        offset += u32.write(this.tableBuffer, offset, strOffset);

        strOffset++;

        const tmp = Buffer.allocUnsafe(
          u32.size + str.calculateSize(rowData[i] as string)
        );

        str.write(tmp, 0, rowData[i] as string);

        this.strBuffers.push(tmp);
      }
    });

    return this;
  }

  addRows(rowsData: BValue[][]): BufferTable {
    rowsData.forEach(row => {
      this.addRow(row);
    });

    return this;
  }

  getData(row: number, col: number): BValue {
    const offset = this.tableOffset + row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== str) {
      return type.read(this.tableBuffer, offset)[0];
    }

    const strOffset = u32.read(this.tableBuffer, offset)[0] as number;

    return str.read(this.strBuffers[strOffset], 0)[0];
  }

  getRow(row: number): BValue[] {
    const result = [];

    for (let i = 0; i < this.schema.length; i++) {
      result.push(this.getData(row, i));
    }

    return result;
  }

  setData(row: number, col: number, value: BValue): BufferTable {
    const offset = this.tableOffset + row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== str) {
      type.write(this.tableBuffer, offset, value);
      return this;
    }

    const strOffset = u32.read(this.tableBuffer, offset)[0] as number;

    const tmp = Buffer.allocUnsafe(
      u32.size + str.calculateSize(value as string)
    );

    str.write(tmp, 0, value as string);

    this.strBuffers[row * this.rowStrCount + strOffset] = tmp;

    return this;
  }

  setRow(row: number, values: BValue[]): BufferTable {
    for (let i = 0; i < this.schema.length; i++) {
      this.setData(row, i, values[i]);
    }

    return this;
  }

  deleteRow(row: number): BufferTable {
    const tableSize = this.getTableSize();
    const newSize = tableSize - this.rowSize;

    this.setTableSize(newSize);
    this.resizeBuffer(newSize);

    const strOffset = row * this.rowStrCount;
    this.strBuffers.splice(strOffset, this.rowStrCount);

    const rowOffset = row * this.rowSize + this.tableOffset;

    if (rowOffset === newSize) return this;

    const tmp = this.tableBuffer.slice(rowOffset + this.rowSize);
    this.tableBuffer.set(tmp, rowOffset);

    return this;
  }

  getRowCount(): number {
    return this.getTableSize() / this.rowSize;
  }

  unpack(): BValue[][] {
    const result = [];

    this.forEach(row => {
      result.push(row);
    });

    return result;
  }

  forEach(fn: (row?: BValue[], index?: number) => void) {
    for (let i = 0; i < this.getRowCount(); i++) {
      fn(this.getRow(i), i);
    }
  }

  getBuffer(): Buffer {
    const tableBuffer = this.tableBuffer.slice(
      0,
      this.getTableSize() + u32.size
    );

    const strBuffersSizeBuffer = Buffer.allocUnsafe(4);
    strBuffersSizeBuffer.writeUInt32BE(this.strBuffers.length, 0);

    return Buffer.concat([
      tableBuffer,
      strBuffersSizeBuffer,
      ...this.strBuffers
    ]);
  }

  static create(schema: BType[]): BufferTable {
    const bt = new BufferTable(schema);
    bt.tableBuffer = Buffer.allocUnsafe(u32.size);
    bt.setTableSize(0);

    return bt;
  }

  static from(buffer: Buffer, schema: BType[]): BufferTable {
    const table = new BufferTable(schema);

    let offset = 0;

    const tmp = u32.read(buffer, offset);

    const tableSize = tmp[0] as number;
    table.tableBuffer = buffer.slice(offset, offset + tableSize + tmp[1]);
    table.setTableSize(tableSize);

    offset += tableSize + tmp[1];

    const tmp2 = u32.read(buffer, offset);

    const strBuffersSize = tmp2[0];
    offset += tmp2[1];

    table.strBuffers = [];

    for (let i = 0; i < strBuffersSize; i++) {
      const tmp3 = u32.read(buffer, offset);
      const strlen = tmp3[0] as number;

      table.strBuffers.push(buffer.slice(offset, offset + strlen + u32.size));
      offset += strlen + u32.size;
    }

    return table;
  }
}
