import {
  BBufferStaticInterface,
  BBufferInterface,
  BValue
} from '../shared/btype';
import { BType, STR_SIZE_TYPE, BSIZE } from '../shared/constants';
import { staticImplements } from '../shared/utils';

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
  private buffer: Uint8Array;
  private dv: DataView;

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
    this.buffer.set(buffer, offset);
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

      return decoder.decode(this.buffer.slice(dataOffset, dataOffset + size));
    }
  }

  getBuffer(): Uint8Array {
    return this.buffer;
  }

  static create(size: number): BBuffer {
    const result = new BBuffer();

    const ab = new ArrayBuffer(size);
    result.buffer = new Uint8Array(ab);
    result.dv = new DataView(ab);

    return result;
  }

  static from(buffer: ArrayBuffer): BBuffer {
    const result = new BBuffer();

    result.buffer = new Uint8Array(buffer);
    result.dv = new DataView(buffer);

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
