import { Result, fail, ok } from 'result';
import {
  Output,
  SchemaIssues,
  object,
  record,
  safeParse,
  string,
  unknown,
} from 'valibot';

const websocketMessageSchema = object({
  type: string(),
  payload: record(string(), unknown()),
});

export function toWebsocketMessage(rawData: string): Result<WebsocketMessage> {
  try {
    const json = JSON.parse(rawData);

    const result = safeParse(websocketMessageSchema, json, {
      abortEarly: true,
    });

    if (result.success === false) {
      return fail(getFirstErrorMessage(result.issues));
    }

    return ok(result.output);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return fail(message);
  }
}

export type WebsocketMessage = Output<typeof websocketMessageSchema>;

function getFirstErrorMessage(issues: SchemaIssues): string {
  const firstIssue = issues[0];
  const path = firstIssue.path ? firstIssue.path[0].key : 'root';
  const message = firstIssue.message + ' at ' + path;
  return message;
}
