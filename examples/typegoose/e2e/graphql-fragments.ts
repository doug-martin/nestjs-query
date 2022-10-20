export const todoItemFields = `
    id
    title
    completed
    description
    age
  `

export const subTaskFields = `
id
title
description
completed
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

export const todoItemAggregateFields = `
count {
  id
  title
  description
  completed
  createdAt
  updatedAt
}
min {
  id
  title
  description
}
max {
  id
  title
  description
}    
`

export const tagAggregateFields = `
count {
  id
  name
  createdAt
  updatedAt
}
min {
  id
  name
}
max {
  id
  name
}
`

export const subTaskAggregateFields = `
count {
  id
  title
  description
  completed
}
min {
  id
  title
  description      
}
max {
  id
  title
  description    
}
`
