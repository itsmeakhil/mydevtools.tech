"use server"

import bcrypt from "bcryptjs"
import type { HashResponse, CompareResponse } from "./types"

const handleBcryptError = (error: unknown): string => {
  return error instanceof Error ? error.message : "Bcrypt operation failed"
}

/**
 * Hashes a string using bcrypt with specified salt rounds
 * @param string - The input string to hash
 * @param saltRounds - Number of salt rounds (4-31)
 * @returns Promise with hash result
 */
export async function hashString(
  string: string,
  saltRounds: number
): Promise<HashResponse> {
  try {
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(string, salt)
    return { success: true, hash }
  } catch (error) {
    return { success: false, error: handleBcryptError(error) }
  }
}

/**
 * Compares a plaintext string with a bcrypt hash
 * @param string - Plaintext input
 * @param hash - Bcrypt hash to compare against
 * @returns Promise with comparison result
 */
export async function compareStrings(
  string: string,
  hash: string
): Promise<CompareResponse> {
  try {
    const isMatch = await bcrypt.compare(string, hash)
    return { success: true, isMatch }
  } catch (error) {
    return { success: false, error: handleBcryptError(error) }
  }
}

