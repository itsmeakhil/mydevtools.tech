"use client"

import { useState, useCallback } from "react"
// import { monotonicFactory } from "ulid"
import {monotonicFactory} from "ulid";
import type { ULIDFormat, GeneratedULID } from "../types/ulid"

const ulid = monotonicFactory()

export function useULID(initialQuantity = 1) {
  const [ids, setIds] = useState<GeneratedULID[]>([])
  const [format, setFormat] = useState<ULIDFormat>("raw")
  const [quantity, setQuantity] = useState(initialQuantity)

  const generateIds = useCallback(() => {
    const newIds = Array.from({ length: quantity }, () => ({
      id: ulid(),
    }))
    setIds(newIds)
  }, [quantity])

  const formatId = useCallback(
    (id: GeneratedULID) => {
      if (format === "json") {
        return id.id
      }
      return id.id
    },
    [format],
  )

  const getFormattedOutput = useCallback(() => {
    if (format === "json") {
      return JSON.stringify(
        ids.map((id) => id.id),
        null,
        2,
      )
    }
    return ids.map((id) => id.id).join("\n")
  }, [format, ids])

  return {
    ids,
    format,
    quantity,
    setFormat,
    setQuantity,
    generateIds,
    formatId,
    getFormattedOutput,
  }
}

