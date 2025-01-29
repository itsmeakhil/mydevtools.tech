"use server"

import bcrypt from "bcryptjs"

export async function hashString(string: string, saltRounds: number) {
  try {
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(string, salt)
    return { success: true, hash }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to hash string",
    }
  }
}

export async function compareStrings(string: string, hash: string) {
  try {
    const isMatch = await bcrypt.compare(string, hash)
    return { success: true, isMatch }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to compare strings",
    }
  }
}

