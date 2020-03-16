import { BType, BValue } from '../shared/btype';
import { u8, u16, u32, i8, i16, i32, f32, f64, bool } from './bptype';
import { str, table } from './bstype';
import { nextPowerOf2 } from '../shared/utils';
import {
  SCHEMA_SIZE_TYPE,
  DATA_SIZE_TYPE,
  SCHEMA_TYPE,
  STR_SIZE_TYPE,
  OFFSET_TYPE,
  VT_BUFFER_SIZE_TYPE,
  TABLE_SIZE_TYPE
} from './constants';

type ValueParam = BValue | BufferTable;

const typeFromIndex = [u8, u16, u32, i8, i16, i32, f32, f64, bool, str, table];

const indexFromType = new Map<BType, number>();
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
  .set(str, 9)
  .set(table, 10);

export class BufferTable {
  private dataBuffer: Buffer;
  private rowSize = 0;
  private colOffsets: number[] = [];
  private schema: BType[] = [];
  private dataOffset = 0;
  private vt: (Buffer | BufferTable)[] = [];
  private rowVTCount = 0;

  private constructor() {
    // noop
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

      if (type === str || type === table) this.rowVTCount++;

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

  addRow(rowData: ValueParam[]): BufferTable {
    const size = this.getDataSize();
    const newSize = size + this.rowSize;

    let offset = size + this.dataOffset;
    let vtOffset = 0;

    this.resizeBuffer(newSize);
    this.setDataSize(newSize);

    this.schema.forEach((type, i) => {
      if (type !== str && type !== table) {
        type.write(this.dataBuffer, offset, rowData[i] as BValue);
      } else {
        OFFSET_TYPE.write(this.dataBuffer, offset, vtOffset);
        vtOffset++;

        if (type === str) {
          this.vt.push(str.create(rowData[i] as string));
        } else {
          this.vt.push(rowData[i] as BufferTable);
        }
      }

      offset += type.size;
    });

    return this;
  }

  addRows(rowsData: ValueParam[][]): BufferTable {
    rowsData.forEach(row => {
      this.addRow(row);
    });

    return this;
  }

  getData(row: number, col: number): ValueParam {
    const offset = this.dataOffset + row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== str && type !== table)
      return type.read(this.dataBuffer, offset);

    const vtOffset = OFFSET_TYPE.read(this.dataBuffer, offset) as number;
    const strIndex = row * this.rowVTCount + vtOffset;

    if (type === str) return str.read(this.vt[strIndex] as Buffer, 0);

    return this.vt[strIndex] as BufferTable;
  }

  getRow(row: number): ValueParam[] {
    const result = [];

    for (let i = 0; i < this.schema.length; i++) {
      result.push(this.getData(row, i));
    }

    return result;
  }

  setData(row: number, col: number, value: ValueParam): BufferTable {
    const offset = this.dataOffset + row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== str && type !== table) {
      type.write(this.dataBuffer, offset, value as BValue);
      return this;
    }

    const vtOffset = OFFSET_TYPE.read(this.dataBuffer, offset) as number;
    const vtIndex = row * this.rowVTCount + vtOffset;

    if (type === str) this.vt[vtIndex] = str.create(value as string);
    else {
      this.vt[vtIndex] = value as BufferTable;
    }

    return this;
  }

  setRow(row: number, values: ValueParam[]): BufferTable {
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

    const strIndex = row * this.rowVTCount;
    this.vt.splice(strIndex, this.rowVTCount);

    const rowOffset = row * this.rowSize + this.dataOffset;

    if (rowOffset === newSize) return this;

    this.dataBuffer.set(
      this.dataBuffer.slice(rowOffset + this.rowSize),
      rowOffset
    );

    return this;
  }

  getRowCount(): number {
    return this.getDataSize() / this.rowSize;
  }

  unpack(): ValueParam[][] {
    const result = [];

    this.forEach(row => {
      result.push(row);
    });

    return result;
  }

  forEach(fn: (row?: ValueParam[], index?: number) => void) {
    for (let i = 0; i < this.getRowCount(); i++) {
      fn(this.getRow(i), i);
    }
  }

  getBuffer(): Buffer {
    const buffer = this.dataBuffer.slice(
      0,
      this.getDataSize() + this.dataOffset
    );

    const vtSizeBuffer = Buffer.allocUnsafe(VT_BUFFER_SIZE_TYPE.size);
    VT_BUFFER_SIZE_TYPE.write(vtSizeBuffer, 0, this.vt.length);

    const vtBuffers: Buffer[] = [];

    this.vt.forEach(value => {
      if (!(value instanceof BufferTable)) vtBuffers.push(value);
      else {
        const tableBuffer = value.getBuffer();
        const tableWithSizeBuffer = Buffer.allocUnsafe(
          tableBuffer.length + TABLE_SIZE_TYPE.size
        );

        TABLE_SIZE_TYPE.write(tableWithSizeBuffer, 0, tableBuffer.length);
        tableWithSizeBuffer.fill(tableBuffer, TABLE_SIZE_TYPE.size);

        vtBuffers.push(tableWithSizeBuffer);
      }
    });

    return Buffer.concat([buffer, vtSizeBuffer, ...vtBuffers]);
  }

  static create(schema: BType[]): BufferTable {
    const bt = new BufferTable();

    bt.init(schema);
    bt.calcInfo();

    return bt;
  }

  static from(buffer: Buffer): BufferTable {
    const result = new BufferTable();

    result.readSchemaFromBuffer(buffer);
    result.calcInfo();

    let offset = result.dataOffset - DATA_SIZE_TYPE.size;

    const dataSize = DATA_SIZE_TYPE.read(buffer, offset) as number;

    result.dataBuffer = buffer.slice(0, dataSize + result.dataOffset);
    result.setDataSize(dataSize);

    offset += dataSize + DATA_SIZE_TYPE.size;

    const vtBuffersSize = VT_BUFFER_SIZE_TYPE.read(buffer, offset) as number;
    offset += VT_BUFFER_SIZE_TYPE.size;

    const vtSchema = [];

    result.schema.forEach(type => {
      if (type === str || type === table) vtSchema.push(type);
    });

    result.vt = [];

    for (let i = 0; i < vtBuffersSize; i++) {
      const type = vtSchema[i % vtSchema.length];

      if (type === str) {
        const strSize = STR_SIZE_TYPE.read(buffer, offset) as number;

        result.vt.push(
          buffer.slice(offset, offset + strSize + STR_SIZE_TYPE.size)
        );

        offset += strSize + STR_SIZE_TYPE.size;
      } else if (type === table) {
        const tableSize = TABLE_SIZE_TYPE.read(buffer, offset) as number;

        offset += TABLE_SIZE_TYPE.size;

        result.vt.push(
          BufferTable.from(buffer.slice(offset, offset + tableSize))
        );

        offset += tableSize;
      }
    }

    return result;
  }
}
