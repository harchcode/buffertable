import { BType, BValue } from './btype';
import { u8, u16, u32, i8, i16, i32, f32, f64, bool } from './bptype';
import { str } from './bstype';
import { nextPowerOf2 } from './utils';
import {
  SCHEMA_SIZE_TYPE,
  DATA_SIZE_TYPE,
  SCHEMA_TYPE,
  STR_SIZE_TYPE,
  STR_OFFSET_TYPE,
  STR_BUFFER_SIZE_TYPE
} from './constants';

export const typeFromIndex = [u8, u16, u32, i8, i16, i32, f32, f64, bool, str];

export const indexFromType = new Map<BType, number>();
indexFromType
  .set(u8, 0)
  .set(u16, 1)
  .set(u32, 2)
  .set(i8, 3)
  .set(i16, 4)
  .set(i32, 5)
  .set(f32, 6)
  .set(f64, 7)
  .set(bool, 8)
  .set(str, 9);

export class BufferTable {
  private dataBuffer: Buffer;
  private rowSize = 0;
  private rowStrCount = 0;
  private colOffsets: number[] = [];
  private strBuffers: Buffer[] = [];
  private schema: BType[] = [];
  private dataOffset = 0;

  private constructor() {
    return;
  }

  private init(schema: BType[]) {
    this.schema = schema;
    this.dataOffset =
      SCHEMA_SIZE_TYPE.size + schema.length + DATA_SIZE_TYPE.size;
    this.dataBuffer = Buffer.allocUnsafe(this.dataOffset);

    SCHEMA_SIZE_TYPE.write(this.dataBuffer, 0, schema.length);
    schema.forEach((type, i) => {
      SCHEMA_TYPE.write(
        this.dataBuffer,
        SCHEMA_SIZE_TYPE.size + i,
        indexFromType.get(type)
      );
    });

    this.setDataSize(0);
  }

  private calcInfo() {
    let colOffset = 0;

    this.schema.forEach(type => {
      this.rowSize += type.size;
      this.colOffsets.push(colOffset);

      if (type === str) this.rowStrCount++;

      colOffset += type.size;
    });
  }

  private readSchemaFromBuffer(buffer: Buffer) {
    const size = SCHEMA_SIZE_TYPE.read(buffer, 0) as number;

    this.schema = [];

    for (let i = 0; i < size; i++) {
      this.schema.push(
        typeFromIndex[
          SCHEMA_TYPE.read(buffer, i + SCHEMA_SIZE_TYPE.size) as number
        ]
      );
    }

    this.dataOffset = SCHEMA_SIZE_TYPE.size + size + DATA_SIZE_TYPE.size;
  }

  private getDataSize(): number {
    return DATA_SIZE_TYPE.read(
      this.dataBuffer,
      this.dataOffset - DATA_SIZE_TYPE.size
    ) as number;
  }

  private setDataSize(value: number) {
    DATA_SIZE_TYPE.write(
      this.dataBuffer,
      this.dataOffset - DATA_SIZE_TYPE.size,
      value
    );

    return this;
  }

  private resizeBuffer(neededSize: number) {
    const size = this.getDataSize();

    if (size >= neededSize && size < neededSize * 2) return this;

    const newSize = nextPowerOf2(neededSize) + this.dataOffset;

    const newBuffer = Buffer.allocUnsafe(newSize);

    if (size < neededSize) {
      newBuffer.set(this.dataBuffer, 0);
    } else {
      newBuffer.set(this.dataBuffer.slice(0, neededSize + this.dataOffset), 0);
    }

    this.dataBuffer = newBuffer;
  }

  addRow(rowData: BValue[]): BufferTable {
    const size = this.getDataSize();
    const newSize = size + this.rowSize;

    let offset = size + this.dataOffset;
    let strOffset = 0;

    this.resizeBuffer(newSize);
    this.setDataSize(newSize);

    this.schema.forEach((type, i) => {
      if (type !== str) {
        type.write(this.dataBuffer, offset, rowData[i]);
      } else {
        STR_OFFSET_TYPE.write(this.dataBuffer, offset, strOffset);
        strOffset++;

        this.strBuffers.push(str.create(rowData[i] as string));
      }

      offset += type.size;
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
    const offset = this.dataOffset + row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== str) {
      return type.read(this.dataBuffer, offset);
    }

    const strOffset = STR_OFFSET_TYPE.read(this.dataBuffer, offset) as number;
    const strIndex = row * this.rowStrCount + strOffset;

    return str.read(this.strBuffers[strIndex], 0);
  }

  getRow(row: number): BValue[] {
    const result = [];

    for (let i = 0; i < this.schema.length; i++) {
      result.push(this.getData(row, i));
    }

    return result;
  }

  setData(row: number, col: number, value: BValue): BufferTable {
    const offset = this.dataOffset + row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== str) {
      type.write(this.dataBuffer, offset, value);
      return this;
    }

    const strOffset = STR_OFFSET_TYPE.read(this.dataBuffer, offset) as number;
    const strIndex = row * this.rowStrCount + strOffset;

    this.strBuffers[strIndex] = str.create(value as string);

    return this;
  }

  setRow(row: number, values: BValue[]): BufferTable {
    for (let i = 0; i < this.schema.length; i++) {
      this.setData(row, i, values[i]);
    }

    return this;
  }

  deleteRow(row: number): BufferTable {
    const size = this.getDataSize();
    const newSize = size - this.rowSize;

    this.setDataSize(newSize);
    this.resizeBuffer(newSize);

    const strIndex = row * this.rowStrCount;
    this.strBuffers.splice(strIndex, this.rowStrCount);

    const rowOffset = row * this.rowSize + this.dataOffset;

    if (rowOffset === newSize) return this;

    const tmp = this.dataBuffer.slice(rowOffset + this.rowSize);
    this.dataBuffer.set(tmp, rowOffset);

    return this;
  }

  getRowCount(): number {
    return this.getDataSize() / this.rowSize;
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
    const buffer = this.dataBuffer.slice(
      0,
      this.getDataSize() + this.dataOffset
    );

    const strBuffersSizeBuffer = Buffer.allocUnsafe(STR_BUFFER_SIZE_TYPE.size);
    STR_BUFFER_SIZE_TYPE.write(strBuffersSizeBuffer, 0, this.strBuffers.length);

    return Buffer.concat([buffer, strBuffersSizeBuffer, ...this.strBuffers]);
  }

  static create(schema: BType[]): BufferTable {
    const bt = new BufferTable();
    bt.init(schema);
    bt.calcInfo();

    return bt;
  }

  static from(buffer: Buffer): BufferTable {
    const table = new BufferTable();
    table.readSchemaFromBuffer(buffer);
    table.calcInfo();

    let offset = table.dataOffset - DATA_SIZE_TYPE.size;

    const tmp = DATA_SIZE_TYPE.read(buffer, offset);

    const dataSize = tmp as number;
    table.dataBuffer = buffer.slice(0, dataSize + table.dataOffset);
    table.setDataSize(dataSize);

    offset += dataSize + DATA_SIZE_TYPE.size;

    const tmp2 = STR_BUFFER_SIZE_TYPE.read(buffer, offset);

    const strBuffersSize = tmp2;
    offset += STR_BUFFER_SIZE_TYPE.size;

    table.strBuffers = [];

    for (let i = 0; i < strBuffersSize; i++) {
      const tmp3 = STR_SIZE_TYPE.read(buffer, offset);
      const strlen = tmp3 as number;

      table.strBuffers.push(
        buffer.slice(offset, offset + strlen + STR_SIZE_TYPE.size)
      );
      offset += strlen + STR_SIZE_TYPE.size;
    }

    return table;
  }
}
