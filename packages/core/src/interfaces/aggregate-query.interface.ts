export type AggregateQuery<DTO> = {
  count?: (keyof DTO)[];
  sum?: (keyof DTO)[];
  avg?: (keyof DTO)[];
  max?: (keyof DTO)[];
  min?: (keyof DTO)[];
  groupBy?: (keyof DTO)[];
};

// const j = `invoiceAgg(filter: {}){
//   groupBy {
//     currency
//     created
//   }
//   max {
//     amount
//     date
//  };
// }`;
//
