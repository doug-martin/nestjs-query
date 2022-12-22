export const todoItemFields = `
    id
    title
    isCompleted
    description
  `

export const subTaskFields = `
id
title
description
completed
todoItemId
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
