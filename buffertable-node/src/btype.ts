export type BValue = number | boolean | string;

export type BType = {
  write: (buffer: Buffer, offset: number, value: BValue) => number;
  read: (buffer: Buffer, offset: number) => [BValue, number];
  size: number;
  calculateSize?: (value: BValue) => number;
  defaultValue: BValue;
};

export const u8: BType = {
  write: (buffer: Buffer, offset: number, value: number): number => {
    buffer.writeUInt8(value, offset);

    return u8.size;
  },
  read: (buffer: Buffer, offset: number): [number, number] => {
    return [buffer.readUInt8(offset), u8.size];
  },
  size: 1,
  defaultValue: 0
};

export const u16: BType = {
  write: (buffer: Buffer, offset: number, value: number): number => {
    buffer.writeUInt16BE(value, offset);

    return u16.size;
  },
  read: (buffer: Buffer, offset: number): [number, number] => {
    return [buffer.readUInt16BE(offset), u16.size];
  },
  size: 2,
  defaultValue: 0
};

export const u32: BType = {
  write: (buffer: Buffer, offset: number, value: number): number => {
    buffer.writeUInt32BE(value, offset);

    return u32.size;
  },
  read: (buffer: Buffer, offset: number): [number, number] => {
    return [buffer.readUInt32BE(offset), u32.size];
  },
  size: 4,
  defaultValue: 0
};

export const i8: BType = {
  write: (buffer: Buffer, offset: number, value: number): number => {
    buffer.writeInt8(value, offset);

    return i8.size;
  },
  read: (buffer: Buffer, offset: number): [number, number] => {
    return [buffer.readInt8(offset), i8.size];
  },
  size: 1,
  defaultValue: 0
};

export const i16: BType = {
  write: (buffer: Buffer, offset: number, value: number): number => {
    buffer.writeInt16BE(value, offset);

    return i16.size;
  },
  read: (buffer: Buffer, offset: number): [number, number] => {
    return [buffer.readInt16BE(offset), i16.size];
  },
  size: 2,
  defaultValue: 0
};

export const i32: BType = {
  write: (buffer: Buffer, offset: number, value: number): number => {
    buffer.writeInt32BE(value, offset);

    return i32.size;
  },
  read: (buffer: Buffer, offset: number): [number, number] => {
    return [buffer.readInt32BE(offset), i32.size];
  },
  size: 4,
  defaultValue: 0
};

export const f32: BType = {
  write: (buffer: Buffer, offset: number, value: number): number => {
    buffer.writeFloatBE(value, offset);

    return f32.size;
  },
  read: (buffer: Buffer, offset: number): [number, number] => {
    return [buffer.readFloatBE(offset), f32.size];
  },
  size: 4,
  defaultValue: 0
};

export const f64: BType = {
  write: (buffer: Buffer, offset: number, value: number): number => {
    buffer.writeDoubleBE(value, offset);

    return f64.size;
  },
  read: (buffer: Buffer, offset: number): [number, number] => {
    return [buffer.readDoubleBE(offset), f64.size];
  },
  size: 8,
  defaultValue: 0
};

export const bool: BType = {
  write: (buffer: Buffer, offset: number, value: boolean): number => {
    buffer.writeUInt8(value ? 1 : 0, offset);

    return bool.size;
  },
  read: (buffer: Buffer, offset: number): [boolean, number] => {
    return [buffer.readUInt8(offset) !== 0, bool.size];
  },
  size: 1,
  defaultValue: false
};

export const str: BType = {
  write: (buffer: Buffer, offset: number, value: string): number => {
    const size = Buffer.byteLength(value);

    buffer.writeUInt32BE(size, offset);
    buffer.write(value, offset + u32.size, size, 'utf-8');

    return size + u32.size;
  },
  read: (buffer: Buffer, offset: number): [string, number] => {
    const size = buffer.readUInt32BE(offset);
    const dataOffset = offset + u32.size;

    return [
      buffer.toString('utf-8', dataOffset, dataOffset + size),
      size + u32.size
    ];
  },
  size: u32.size, // this is the size of offset
  calculateSize: (value: string) => {
    return Buffer.byteLength(value) + u32.size;
  },
  defaultValue: ''
};

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
