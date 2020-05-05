import { Class } from '../common';

export function getQueryServiceToken<DTO>(DTOClass: Class<DTO>): string {
  return `${DTOClass.name}QueryService`;
}
