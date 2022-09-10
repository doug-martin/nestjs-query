export const todoItemFields = `
    id
  `

export const subTaskFields = `
id
title
description
completed
todoItemId
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
