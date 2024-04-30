import { SchemaIssues } from 'valibot';
import { getFirstErrorMessage } from './validation-helpers';

export function createMessage(
  type: string,
  data: Record<string, unknown>
): string {
  return JSON.stringify({ type, data });
}

export function errorMessage(validation: string | SchemaIssues): string {
  const message =
    typeof validation === 'string'
      ? validation
      : getFirstErrorMessage(validation);

  return createMessage('error', { validation: message });
}
