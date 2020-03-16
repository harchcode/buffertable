import { BType } from '../shared/btype';

export const u8: BType = {
  write: (buffer: Buffer, offset: number, value = 0) => {
    buffer.writeUInt8(value as number, offset);
  },
  read: (buffer: Buffer, offset: number): number => {
    return buffer.readUInt8(offset);
  },
  size: 1
};

export const u16: BType = {
  write: (buffer: Buffer, offset: number, value = 0) => {
    buffer.writeUInt16BE(value as number, offset);
  },
  read: (buffer: Buffer, offset: number): number => {
    return buffer.readUInt16BE(offset);
  },
  size: 2
};

export const u32: BType = {
  write: (buffer: Buffer, offset: number, value = 0) => {
    buffer.writeUInt32BE(value as number, offset);
  },
  read: (buffer: Buffer, offset: number): number => {
    return buffer.readUInt32BE(offset);
  },
  size: 4
};

export const i8: BType = {
  write: (buffer: Buffer, offset: number, value = 0) => {
    buffer.writeInt8(value as number, offset);
  },
  read: (buffer: Buffer, offset: number): number => {
    return buffer.readInt8(offset);
  },
  size: 1
};

export const i16: BType = {
  write: (buffer: Buffer, offset: number, value = 0) => {
    buffer.writeInt16BE(value as number, offset);
  },
  read: (buffer: Buffer, offset: number): number => {
    return buffer.readInt16BE(offset);
  },
  size: 2
};

export const i32: BType = {
  write: (buffer: Buffer, offset: number, value = 0) => {
    buffer.writeInt32BE(value as number, offset);
  },
  read: (buffer: Buffer, offset: number): number => {
    return buffer.readInt32BE(offset);
  },
  size: 4
};

export const f32: BType = {
  write: (buffer: Buffer, offset: number, value = 0) => {
    buffer.writeFloatBE(value as number, offset);
  },
  read: (buffer: Buffer, offset: number): number => {
    return buffer.readFloatBE(offset);
  },
  size: 4
};

export const f64: BType = {
  write: (buffer: Buffer, offset: number, value = 0) => {
    buffer.writeDoubleBE(value as number, offset);
  },
  read: (buffer: Buffer, offset: number): number => {
    return buffer.readDoubleBE(offset);
  },
  size: 8
};

export const bool: BType = {
  write: (buffer: Buffer, offset: number, value = false) => {
    buffer.writeUInt8(value ? 1 : 0, offset);
  },
  read: (buffer: Buffer, offset: number): boolean => {
    return buffer.readUInt8(offset) !== 0;
  },
  size: 1
};
