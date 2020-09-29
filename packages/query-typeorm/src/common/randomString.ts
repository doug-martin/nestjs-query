import { v4 } from 'uuid';

export function randomString(): string {
  return v4().replace(/-/g, '');
}
