import { SchemaIssues } from 'valibot';

export function getFirstErrorMessage(issues: SchemaIssues): string {
  const firstIssue = issues[0];
  const path = firstIssue.path ? firstIssue.path[0].key : 'root';
  const message = firstIssue.message + ' at ' + path;
  return message;
}
