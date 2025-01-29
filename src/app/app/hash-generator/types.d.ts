declare module "crypto" {
    export function createHash(algorithm: string): Hash
    export interface Hash {
      update(data: string): Hash
      digest(encoding: "hex" | "base64" | "binary"): string
    }
  }
  
  