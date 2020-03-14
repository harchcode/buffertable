import { BufferTable } from './buffertable';

export type BValue = number | boolean | string | BufferTable;

export type BType = {
  write: (buffer: Buffer, offset: number, value: BValue, size?: number) => void;
  read: (buffer: Buffer, offset: number) => BValue;
  size: number;
  create?: (value: BValue) => Buffer;
};
