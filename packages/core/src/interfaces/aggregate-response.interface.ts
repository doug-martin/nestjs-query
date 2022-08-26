export type NumberAggregate<DTO> = {
  [K in keyof DTO]?: number
}

export type TypeAggregate<DTO> = {
  [K in keyof DTO]?: DTO[K]
}

export type AggregateResponse<DTO> = {
  count?: NumberAggregate<DTO>
  sum?: NumberAggregate<DTO>
  avg?: NumberAggregate<DTO>
  max?: TypeAggregate<DTO>
  min?: TypeAggregate<DTO>
  groupBy?: Partial<DTO>
}
