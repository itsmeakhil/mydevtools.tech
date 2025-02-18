export interface StatusCode {
    code: number
    title: string
    description: string
  }
  
  export interface StatusCodeSection {
    title: string
    description: string
    codes: StatusCode[]
  }
  
  