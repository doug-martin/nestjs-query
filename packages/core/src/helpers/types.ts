import { CommonFieldComparisonBetweenType } from '../interfaces';

export type FilterFn<DTO> = (dto?: DTO) => boolean;

export type ComparisonField<DTO, F extends keyof DTO> =
  | DTO[F]
  | DTO[F][]
  | CommonFieldComparisonBetweenType<DTO[F]>
  | true
  | false
  | null;
