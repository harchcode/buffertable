import {
  BBufferStaticInterface,
  BBufferInterface,
  BValue
} from '../shared/btype';
import { BType, STR_SIZE_TYPE, BSIZE } from '../shared/constants';
import { staticImplements } from '../shared/utils';

const BFuncKey = [
  'UInt8',
  'UInt16BE',
  'UInt32BE',
  'Int8',
  'Int16BE',
  'Int32BE',
  'FloatBE',
  'DoubleBE',
  'UInt8'
];

@staticImplements<BBufferStaticInterface>()
export class BBuffer implements BBufferInterface {
  private buffer: Buffer;

  private constructor() {
    // noop
  }

  slice(start?: number, end?: number): BBuffer {
    const result = new BBuffer();
    result.buffer = this.buffer.slice(start, end);

    return result;
  }

  set(bBuffer: BBuffer, offset?: number) {
    this.buffer.set(bBuffer.buffer, offset);
  }

  fill(buffer: Uint8Array, offset?: number) {
    this.buffer.fill(buffer, offset);
  }

  write(type: BType, offset: number, value: BValue) {
    if (type >= BType.U8 && type <= BType.F64) {
      this.buffer[`write${BFuncKey[type]}`](value as number, offset);
    } else if (type === BType.BOOL) {
      this.buffer[`write${BFuncKey[type]}`](value ? 1 : 0, offset);
    }
  }

  read(type: BType, offset: number): BValue {
    if (type >= BType.U8 && type <= BType.F64) {
      return this.buffer[`read${BFuncKey[type]}`](offset);
    } else if (type === BType.BOOL) {
      return this.buffer[`read${BFuncKey[type]}`](offset) > 0;
    } else if (type === BType.STR) {
      const size = this.read(STR_SIZE_TYPE, offset) as number;
      const dataOffset = offset + BSIZE[STR_SIZE_TYPE];

      return this.buffer.toString('utf-8', dataOffset, dataOffset + size);
    }
  }

  getBuffer(): Uint8Array {
    return this.buffer;
  }

  static create(size: number): BBuffer {
    const result = new BBuffer();
    result.buffer = Buffer.allocUnsafe(size);

    return result;
  }

  static from(buffer: ArrayBuffer): BBuffer {
    const result = new BBuffer();
    result.buffer = Buffer.from(buffer);

    return result;
  }

  static fromStr(value: string): BBuffer {
    const valueSize = Buffer.byteLength(value as string);
    const strTypeSize = BSIZE[STR_SIZE_TYPE];

    const result = BBuffer.create(valueSize + strTypeSize);

    result.write(STR_SIZE_TYPE, 0, valueSize);
    result.buffer.write(value, strTypeSize, valueSize, 'utf-8');

    return result;
  }

  static concat(buffers: Uint8Array[]): Uint8Array {
    return Buffer.concat(buffers);
  }
}
