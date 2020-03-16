import { BBuffer } from './bbuffer';
import {
  BValue,
  BufferTableStaticInterface,
  BufferTableInterface,
  BTValue
} from '../shared/btype';
import { nextPowerOf2, staticImplements } from '../shared/utils';
import {
  BType,
  SCHEMA_SIZE_TYPE,
  DATA_SIZE_TYPE,
  SCHEMA_TYPE,
  STR_SIZE_TYPE,
  OFFSET_TYPE,
  VT_BUFFER_SIZE_TYPE,
  TABLE_SIZE_TYPE,
  BSIZE
} from '../shared/constants';

@staticImplements<BufferTableStaticInterface>()
export class BufferTable implements BufferTableInterface {
  private dataBuffer: BBuffer;
  private rowSize = 0;
  private colOffsets: number[] = [];
  private schema: BType[] = [];
  private dataOffset = 0;
  private vt: (BBuffer | BufferTable)[] = [];
  private rowVTCount = 0;

  private constructor() {
    // noop
  }

  private init(schema: BType[]) {
    this.schema = schema;

    this.dataOffset =
      BSIZE[SCHEMA_SIZE_TYPE] + schema.length + BSIZE[DATA_SIZE_TYPE];

    this.dataBuffer = BBuffer.create(this.dataOffset);

    this.dataBuffer.write(SCHEMA_SIZE_TYPE, 0, schema.length);

    schema.forEach((type, i) => {
      this.dataBuffer.write(SCHEMA_TYPE, BSIZE[SCHEMA_SIZE_TYPE] + i, type);
    });

    this.setDataSize(0);
  }

  private calcInfo() {
    let colOffset = 0;

    this.schema.forEach(type => {
      this.rowSize += BSIZE[type];
      this.colOffsets.push(colOffset);

      if (type === BType.STR || type === BType.TABLE) this.rowVTCount++;

      colOffset += BSIZE[type];
    });
  }

  private readSchemaFromBuffer(buffer: BBuffer) {
    const size = buffer.read(SCHEMA_SIZE_TYPE, 0) as number;

    this.schema = [];

    for (let i = 0; i < size; i++) {
      this.schema.push(
        buffer.read(SCHEMA_TYPE, i + BSIZE[SCHEMA_SIZE_TYPE]) as BType
      );
    }

    this.dataOffset = BSIZE[SCHEMA_SIZE_TYPE] + size + BSIZE[DATA_SIZE_TYPE];
  }

  private getDataSize(): number {
    return this.dataBuffer.read(
      DATA_SIZE_TYPE,
      this.dataOffset - BSIZE[DATA_SIZE_TYPE]
    ) as number;
  }

  private setDataSize(value: number) {
    this.dataBuffer.write(
      DATA_SIZE_TYPE,
      this.dataOffset - BSIZE[DATA_SIZE_TYPE],
      value
    );

    return this;
  }

  private resizeBuffer(neededSize: number) {
    const size = this.getDataSize();

    if (size >= neededSize && size < neededSize * 2) return this;

    const newSize = nextPowerOf2(neededSize) + this.dataOffset;

    const newBuffer = BBuffer.create(newSize);

    if (size < neededSize) {
      newBuffer.set(this.dataBuffer, 0);
    } else {
      newBuffer.set(this.dataBuffer.slice(0, neededSize + this.dataOffset), 0);
    }

    this.dataBuffer = newBuffer;
  }

  addRow(rowData: BTValue[]): BufferTable {
    const size = this.getDataSize();
    const newSize = size + this.rowSize;

    let offset = size + this.dataOffset;
    let vtOffset = 0;

    this.resizeBuffer(newSize);
    this.setDataSize(newSize);

    this.schema.forEach((type, i) => {
      if (type !== BType.STR && type !== BType.TABLE) {
        this.dataBuffer.write(type, offset, rowData[i] as BValue);
      } else {
        this.dataBuffer.write(OFFSET_TYPE, offset, vtOffset);
        vtOffset++;

        if (type === BType.STR) {
          this.vt.push(BBuffer.fromStr(rowData[i] as string));
        } else {
          this.vt.push((rowData[i] as unknown) as BufferTable);
        }
      }

      offset += BSIZE[type];
    });

    return this;
  }

  addRows(rowsData: BTValue[][]): BufferTable {
    rowsData.forEach(row => {
      this.addRow(row);
    });

    return this;
  }

  getData(row: number, col: number): BTValue {
    const offset = this.dataOffset + row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== BType.STR && type !== BType.TABLE)
      return this.dataBuffer.read(type, offset);

    const vtOffset = this.dataBuffer.read(OFFSET_TYPE, offset) as number;
    const vtIndex = row * this.rowVTCount + vtOffset;

    if (type === BType.STR) return (this.vt[vtIndex] as BBuffer).read(type, 0);

    return (this.vt[vtIndex] as unknown) as BufferTable;
  }

  getRow(row: number): BTValue[] {
    const result = [];

    for (let i = 0; i < this.schema.length; i++) {
      result.push(this.getData(row, i));
    }

    return result;
  }

  setData(row: number, col: number, value: BTValue): BufferTable {
    const offset = this.dataOffset + row * this.rowSize + this.colOffsets[col];
    const type = this.schema[col];

    if (type !== BType.STR && type !== BType.TABLE) {
      this.dataBuffer.write(type, offset, value as BValue);
      return this;
    }

    const vtOffset = this.dataBuffer.read(OFFSET_TYPE, offset) as number;
    const vtIndex = row * this.rowVTCount + vtOffset;

    if (type === BType.STR) this.vt[vtIndex] = BBuffer.fromStr(value as string);
    else {
      this.vt[vtIndex] = (value as unknown) as BufferTable;
    }

    return this;
  }

  setRow(row: number, values: BTValue[]): BufferTable {
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

  unpack(): BTValue[][] {
    const result = [];

    this.forEach(row => {
      result.push(row);
    });

    return result;
  }

  forEach(fn: (row?: BTValue[], index?: number) => void) {
    for (let i = 0; i < this.getRowCount(); i++) {
      fn(this.getRow(i), i);
    }
  }

  getBuffer(): Uint8Array {
    const buffer = this.dataBuffer.slice(
      0,
      this.getDataSize() + this.dataOffset
    );

    const vtSizeBuffer = BBuffer.create(BSIZE[VT_BUFFER_SIZE_TYPE]);
    vtSizeBuffer.write(VT_BUFFER_SIZE_TYPE, 0, this.vt.length);

    const vtBuffers: Uint8Array[] = [];

    this.vt.forEach(value => {
      if (!(value instanceof BufferTable)) vtBuffers.push(value.getBuffer());
      else {
        const tableBuffer = value.getBuffer();

        const tableWithSizeBuffer = BBuffer.create(
          tableBuffer.byteLength + BSIZE[TABLE_SIZE_TYPE]
        );

        tableWithSizeBuffer.write(TABLE_SIZE_TYPE, 0, tableBuffer.byteLength);
        tableWithSizeBuffer.fill(tableBuffer, BSIZE[TABLE_SIZE_TYPE]);

        vtBuffers.push(tableWithSizeBuffer.getBuffer());
      }
    });

    return BBuffer.concat([
      buffer.getBuffer(),
      vtSizeBuffer.getBuffer(),
      ...vtBuffers
    ]);
  }

  static create(schema: BType[]): BufferTable {
    const bt = new BufferTable();

    bt.init(schema);
    bt.calcInfo();

    return bt;
  }

  static from(arrayBuffer: ArrayBuffer): BufferTable {
    const result = new BufferTable();

    const buffer = BBuffer.from(arrayBuffer);

    result.readSchemaFromBuffer(buffer);
    result.calcInfo();

    let offset = result.dataOffset - BSIZE[DATA_SIZE_TYPE];

    const dataSize = buffer.read(DATA_SIZE_TYPE, offset) as number;

    result.dataBuffer = buffer.slice(0, dataSize + result.dataOffset);
    result.setDataSize(dataSize);

    offset += dataSize + BSIZE[DATA_SIZE_TYPE];

    const vtBuffersSize = buffer.read(VT_BUFFER_SIZE_TYPE, offset) as number;
    offset += BSIZE[VT_BUFFER_SIZE_TYPE];

    const vtSchema = [];

    result.schema.forEach(type => {
      if (type === BType.STR || type === BType.TABLE) vtSchema.push(type);
    });

    result.vt = [];

    for (let i = 0; i < vtBuffersSize; i++) {
      const type = vtSchema[i % vtSchema.length];

      if (type === BType.STR) {
        const strSize = buffer.read(STR_SIZE_TYPE, offset) as number;

        result.vt.push(
          buffer.slice(offset, offset + strSize + BSIZE[STR_SIZE_TYPE])
        );

        offset += strSize + BSIZE[STR_SIZE_TYPE];
      } else if (type === BType.TABLE) {
        const tableSize = buffer.read(TABLE_SIZE_TYPE, offset) as number;

        offset += BSIZE[TABLE_SIZE_TYPE];

        result.vt.push(
          BufferTable.from(buffer.slice(offset, offset + tableSize).getBuffer())
        );

        offset += tableSize;
      }
    }

    return result;
  }
}
