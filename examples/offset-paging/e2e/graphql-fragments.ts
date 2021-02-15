export const todoItemFields = `
    id
    title
    completed
    description
  `;

export const subTaskFields = `
id
title
description
completed
todoItemId
`;

export const tagFields = `
id
name
`;

export const pageInfoField = `
pageInfo{
  hasNextPage
  hasPreviousPage
}
`;

export const nodes = (fields: string): string => `
  nodes {  
    ${fields}        
  }  
  `;

export const offsetConnection = (fields: string): string => `
  ${nodes(fields)}
  ${pageInfoField}
`;
