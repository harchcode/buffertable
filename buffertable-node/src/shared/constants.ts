export enum BType {
  U8 = 'u8',
  U16 = 'u16',
  U32 = 'u32',
  I8 = 'i8',
  I16 = 'i16',
  I32 = 'i32',
  F32 = 'f32',
  F64 = 'f64',
  BOOL = 'bool',
  STR = 'str',
  TABLE = 'table'
}

export const SCHEMA_SIZE_TYPE = BType.U8;
export const SCHEMA_TYPE = BType.U8;
export const OFFSET_TYPE = BType.U8;
export const VT_BUFFER_SIZE_TYPE = BType.U32;
export const STR_SIZE_TYPE = BType.U16;
export const DATA_SIZE_TYPE = BType.U32;
export const TABLE_SIZE_TYPE = BType.U32;
