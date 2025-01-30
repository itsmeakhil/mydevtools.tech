/** Base response format for cryptographic operations */
interface BaseResponse {
  success: boolean
  error?: string
}

export interface HashResponse extends BaseResponse {
  hash?: string
}

export interface CompareResponse extends BaseResponse {
  isMatch?: boolean
}