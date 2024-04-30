export type Ok<T> = { type: 'ok'; data: T };
export type Fail = { type: 'fail'; error: string };
export type Result<T> = Ok<T> | Fail;

export function ok<T>(data: T): Result<T> {
  return { type: 'ok', data };
}

export function fail(error: string): Result<never> {
  return { type: 'fail', error };
}

export function isFail<T>(result: Result<T>): result is Fail {
  return result.type === 'fail';
}
