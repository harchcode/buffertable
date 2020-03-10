import { BType } from './btype';
import { STR_SIZE_TYPE, STR_OFFSET_TYPE } from './constants';

export const str: BType = {
  write: (buffer: Buffer, offset: number, value = '') => {
    const size = Buffer.byteLength(value as string);

    STR_SIZE_TYPE.write(buffer, offset, size);
    buffer.write(value as string, offset + STR_SIZE_TYPE.size, size, 'utf-8');
  },
  read: (buffer: Buffer, offset: number): string => {
    const size = STR_SIZE_TYPE.read(buffer, offset) as number;
    const dataOffset = offset + STR_SIZE_TYPE.size;

    return buffer.toString('utf-8', dataOffset, dataOffset + size);
  },
  size: STR_OFFSET_TYPE.size, // this is the size of offset
  create: (value = ''): Buffer => {
    const size = Buffer.byteLength(value as string);
    const buffer = Buffer.allocUnsafe(size + STR_SIZE_TYPE.size);

    STR_SIZE_TYPE.write(buffer, 0, size);
    buffer.write(value as string, STR_SIZE_TYPE.size, size, 'utf-8');

    return buffer;
  }
};
