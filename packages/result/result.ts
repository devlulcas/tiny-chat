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

export function isOk<T>(result: Result<T>): result is Ok<T> {
  return result.type === 'ok';
}

export async function wrapAsync<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return ok(data);
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : String(error).toString()
    );
  }
}

export function unwrapThrow<T>(result: Result<T>): T {
  if (isFail(result)) {
    throw new Error(result.error);
  }

  return result.data;
}

export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return isOk(result) ? result.data : defaultValue;
}

export function unwrapOrElse<T>(result: Result<T>, fn: () => T): T {
  return isOk(result) ? result.data : fn();
}
