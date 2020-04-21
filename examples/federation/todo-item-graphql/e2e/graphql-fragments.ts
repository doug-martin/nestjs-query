export const todoItemFields = `
    id
    title
    completed
    description
  `;

export const pageInfoField = `
pageInfo{
  hasNextPage
  hasPreviousPage
  startCursor
  endCursor
}
`;

export const edgeNodes = (fields: string): string => {
  return `
  edges {
    node{
      ${fields}    
    }
    cursor
  }  
  `;
};
