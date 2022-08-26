export const todoItemFields = `
    id
  `

export const tagFields = `
id
name
`

export const pageInfoField = `
pageInfo{
  hasNextPage
  hasPreviousPage
  startCursor
  endCursor
}
`

export const edgeNodes = (fields: string): string => `
  edges {
    node{
      ${fields}    
    }
    cursor
  }  
  `
