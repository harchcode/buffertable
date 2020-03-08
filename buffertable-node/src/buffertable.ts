import { BType, BValue, str, u32 } from './btype';
import { nextPowerOf2 } from './utils';

export class BufferTable {
  private tableBuffer: Buffer;
  private tableSize = 0;
  private rowSize = 0;
  private rowStrCount = 0;
  private colOffsets: number[] = [];
  private strBuffers: Buffer[] = [];
  private schema: BType[] = [];

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

  private resizeBuffer(buffer: Buffer, neededSize: number): Buffer {
    const size = buffer.byteLength;

    if (size >= neededSize && size < neededSize * 2) return buffer;

    const newSize = nextPowerOf2(neededSize);

    const newBuffer = Buffer.allocUnsafe(newSize);

    if (size < neededSize) {
      newBuffer.set(buffer, 0);
    } else {
      newBuffer.set(buffer.slice(0, neededSize), 0);
    }

    return newBuffer;
  }

  addRow(rowData: BValue[]): BufferTable {
    let strOffset = 0;

    this.schema.forEach((type, i) => {
      this.tableBuffer = this.resizeBuffer(
        this.tableBuffer,
        this.tableSize + this.rowSize
      );

      if (type !== str) {
        this.tableSize += type.write(
          this.tableBuffer,
          this.tableSize,
          rowData[i]
        );
      } else {
        this.tableSize += u32.write(
          this.tableBuffer,
          this.tableSize,
          strOffset
        );

        strOffset++;

        this.strBuffers.push(Buffer.from(rowData[i] as string, 'utf-8'));
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
    const offset = row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== str) {
      return type.read(this.tableBuffer, offset)[0];
    }

    const strOffset = u32.read(this.tableBuffer, offset)[0] as number;

    return this.strBuffers[strOffset].toString('utf-8');
  }

  getRow(row: number): BValue[] {
    const result = [];

    for (let i = 0; i < this.schema.length; i++) {
      result.push(this.getData(row, i));
    }

    return result;
  }

  setData(row: number, col: number, value: BValue): BufferTable {
    const offset = row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== str) {
      type.write(this.tableBuffer, offset, value);
      return this;
    }

    const strOffset = u32.read(this.tableBuffer, offset)[0] as number;
    this.strBuffers[row * this.rowStrCount + strOffset] = Buffer.from(
      value as string,
      'utf-8'
    );

    return this;
  }

  setRow(row: number, values: BValue[]): BufferTable {
    for (let i = 0; i < this.schema.length; i++) {
      this.setData(row, i, values[i]);
    }

    return this;
  }

  deleteRow(row: number): BufferTable {
    const strOffset = row * this.rowStrCount;
    this.strBuffers.splice(strOffset, this.rowStrCount);

    const moveOffset = (row + 1) * this.rowSize;
    const rowOffset = row * this.rowSize;
    this.tableSize -= this.rowSize;

    if (rowOffset === this.tableSize) return this;

    const tmp = this.tableBuffer.slice(moveOffset);
    this.tableBuffer.set(tmp, rowOffset);

    this.tableBuffer = this.resizeBuffer(this.tableBuffer, this.tableSize);

    return this;
  }

  getRowCount(): number {
    return this.tableSize / this.rowSize;
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

  static create(schema: BType[]): BufferTable {
    const bt = new BufferTable(schema);
    bt.tableBuffer = Buffer.allocUnsafe(0);

    return bt;
  }

  static from(buffer: Buffer, schema: BType[]): BufferTable {
    return new BufferTable(schema);
  }
}
