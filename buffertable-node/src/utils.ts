export function isArray(value) {
  return value && typeof value === 'object' && value.constructor === Array;
}

export function isObject(value) {
  return (
    value &&
    typeof value === 'object' &&
    value.constructor === Object &&
    !value.write
  );
}

export function nextPowerOf2(value: number): number {
  let result = value;

  result--;
  result |= result >> 1;
  result |= result >> 2;
  result |= result >> 4;
  result |= result >> 8;
  result |= result >> 16;
  result++;

  return result;
}
