import { BBufferStaticInterface, BBufferInterface, BValue } from './btype';
import { BType, STR_SIZE_TYPE, BSIZE } from './constants';
import { staticImplements } from './utils';

const BFuncKey = [
  'Uint8',
  'Uint16',
  'Uint32',
  'Int8',
  'Int16',
  'Int32',
  'Float32',
  'Float64',
  'Uint8'
];

const encoder = new TextEncoder();
const decoder = new TextDecoder();

@staticImplements<BBufferStaticInterface>()
export class BBuffer implements BBufferInterface {
  private arr: Uint8Array;
  private dv: DataView;

  private constructor() {
    // noop
  }

  slice(start = 0, end?: number): BBuffer {
    return BBuffer.from(this.arr.slice(start, end));
  }

  set(bBuffer: BBuffer, offset?: number) {
    this.arr.set(bBuffer.arr, offset);
  }

  fill(buffer: Uint8Array, offset?: number) {
    this.arr.set(buffer, offset);
  }

  write(type: BType, offset: number, value: BValue) {
    if (type >= BType.U8 && type <= BType.F64) {
      this.dv[`set${BFuncKey[type]}`](offset, value as number);
    } else if (type === BType.BOOL) {
      this.dv[`set${BFuncKey[type]}`](offset, value ? 1 : 0);
    }
  }

  read(type: BType, offset: number): BValue {
    if (type >= BType.U8 && type <= BType.F64) {
      return this.dv[`get${BFuncKey[type]}`](offset);
    } else if (type === BType.BOOL) {
      return this.dv[`get${BFuncKey[type]}`](offset) > 0;
    } else if (type === BType.STR) {
      const size = this.read(STR_SIZE_TYPE, offset) as number;
      const dataOffset = offset + BSIZE[STR_SIZE_TYPE];

      return decoder.decode(this.arr.slice(dataOffset, dataOffset + size));
    }
  }

  toUint8Array(): Uint8Array {
    return this.arr;
  }

  static create(size: number): BBuffer {
    const result = new BBuffer();

    const ab = new ArrayBuffer(size);
    result.arr = new Uint8Array(ab);
    result.dv = new DataView(ab);

    return result;
  }

  static from(buffer: Uint8Array): BBuffer {
    const result = new BBuffer();

    result.arr = buffer;
    result.dv = new DataView(buffer.buffer);

    return result;
  }

  static fromStr(value: string): BBuffer {
    const encodedBuffer = encoder.encode(value);
    const valueSize = encodedBuffer.byteLength;
    const strTypeSize = BSIZE[STR_SIZE_TYPE];

    const result = BBuffer.create(valueSize + strTypeSize);

    result.write(STR_SIZE_TYPE, 0, valueSize);
    result.fill(encodedBuffer, strTypeSize);

    return result;
  }

  static concat(buffers: Uint8Array[]): Uint8Array {
    const size = buffers.reduce(
      (prev, current) => prev + current.byteLength,
      0
    );

    const result = new Uint8Array(size);
    let offset = 0;

    buffers.forEach(b => {
      result.set(b, offset);
      offset += b.byteLength;
    });

    return result;
  }
}
