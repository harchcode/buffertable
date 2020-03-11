import { BType } from './btype';
import { STR_SIZE_TYPE, OFFSET_TYPE } from './constants';

export const str: BType = {
  write: (buffer: Buffer, offset: number, value = '', size: number) => {
    STR_SIZE_TYPE.write(buffer, offset, size);
    buffer.write(value as string, offset + STR_SIZE_TYPE.size, size, 'utf-8');
  },
  read: (buffer: Buffer, offset: number): string => {
    const size = STR_SIZE_TYPE.read(buffer, offset) as number;
    const dataOffset = offset + STR_SIZE_TYPE.size;

    return buffer.toString('utf-8', dataOffset, dataOffset + size);
  },
  size: OFFSET_TYPE.size,
  create: (value = ''): Buffer => {
    const size = Buffer.byteLength(value as string);
    const buffer = Buffer.allocUnsafe(size + STR_SIZE_TYPE.size);

    str.write(buffer, 0, value, size);

    return buffer;
  }
};

export const table: BType = {
  write: () => {
    // noop
  },
  read: (): null => {
    return null;
  },
  size: OFFSET_TYPE.size
};
