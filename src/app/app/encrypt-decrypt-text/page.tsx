"use client"

import * as CryptoJS from "crypto-js"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card"


type Algorithm = "AES" | "TripleDES" | "Rabbit" | "RC4"
type CryptoOperations = {
  encrypt: (text: string, key: string) => string
  decrypt: (encrypted: string, key: string) => CryptoJS.lib.WordArray
}

export default function EncryptDecrypt() {
  // Combined state objects
  const [encryptState, setEncryptState] = useState<{
    text: string;
    key: string;
    algorithm: Algorithm;
    result: string;
  }>({
    text: "Lorem ipsum dolor sit amet",
    key: "my secret key",
    algorithm: "AES" as Algorithm,
    result: ""
  })

  const [decryptState, setDecryptState] = useState<{
    text: string;
    key: string;
    algorithm: Algorithm;
    result: string;
  }>({
    text: "",
    key: "my secret key",
    algorithm: "AES" as Algorithm,
    result: "Your string hash"
  })

  // Algorithm operations lookup
  const cryptoOperations = useMemo<Record<Algorithm, CryptoOperations>>(
    () => ({
      AES: {
        encrypt: (t, k) => CryptoJS.AES.encrypt(t, k).toString(),
        decrypt: (e, k) => CryptoJS.AES.decrypt(e, k)
      },
      TripleDES: {
        encrypt: (t, k) => CryptoJS.TripleDES.encrypt(t, k).toString(),
        decrypt: (e, k) => CryptoJS.TripleDES.decrypt(e, k)
      },
      Rabbit: {
        encrypt: (t, k) => CryptoJS.Rabbit.encrypt(t, k).toString(),
        decrypt: (e, k) => CryptoJS.Rabbit.decrypt(e, k)
      },
      RC4: {
        encrypt: (t, k) => CryptoJS.RC4.encrypt(t, k).toString(),
        decrypt: (e, k) => CryptoJS.RC4.decrypt(e, k)
      }
    }),
    []
  )

  // Unified crypto handler
  const handleCrypto = useCallback(
    (type: "encrypt" | "decrypt") => {
      try {
        const state = type === "encrypt" ? encryptState : decryptState
        const operation = cryptoOperations[state.algorithm][type]
        
        if (type === "encrypt") {
          const result = operation(state.text, state.key)
          setEncryptState(prev => ({ ...prev, result }))
          setDecryptState(prev => ({ ...prev, text: result }))
        } else {
          const decryptedWordArray = operation(state.text, state.key) as CryptoJS.lib.WordArray
          const result = decryptedWordArray.sigBytes > 0 
            ? decryptedWordArray.toString(CryptoJS.enc.Utf8) 
            : "Your string hash"
          setDecryptState(prev => ({ ...prev, result }))
        }
      } catch (error) {
        console.error(`${type}ion error:`, error)
        const message = type === "encrypt" ? "Encryption failed" : "Your string hash"
        type === "encrypt"
          ? setEncryptState(prev => ({ ...prev, result: message }))
          : setDecryptState(prev => ({ ...prev, result: message }))
      }
    },
    [encryptState, decryptState, cryptoOperations]
  )

  // Auto-resize textareas using ref callback
  const textareaRefs = useRef<{
    encrypted?: HTMLTextAreaElement
    decrypt?: HTMLTextAreaElement
  }>({})

  const adjustHeight = useCallback((element: HTMLTextAreaElement) => {
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }, [])

  // Effect for initial setup
  useEffect(() => {
    handleCrypto("encrypt")
    handleCrypto("decrypt")
  }, [])

  // Effect for textarea resizing
  useEffect(() => {
    Object.values(textareaRefs.current).forEach(adjustHeight)
  }, [encryptState.result, decryptState.text, adjustHeight])

  // Reusable input handlers
  const createStateHandler = useCallback(
    (
      type: "encrypt" | "decrypt",
      field: "text" | "key" | "algorithm" // Exclude 'result'
    ) =>
    (value: string | Algorithm) => {
      const updater = type === "encrypt" ? setEncryptState : setDecryptState
      updater(prev => ({ ...prev, [field]: value }))
      setTimeout(() => handleCrypto(type), 0)
    },
    [handleCrypto]
  )

  // Memoized card components
  const CryptoCard = useCallback(
    ({ type }: { type: "encrypt" | "decrypt" }) => {
      const state = type === "encrypt" ? encryptState : decryptState
      const isEncrypt = type === "encrypt"
      
      return (
        <Card className="bg-transparent border-gray-200">
          <CardHeader>
            <CardTitle>{isEncrypt ? "Encrypt" : "Decrypt"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Textarea Input */}
            <div className="space-y-2">
              <Label>{isEncrypt ? "Your text:" : "Your encrypted text:"}</Label>
              <Textarea
                ref={useCallback((el: HTMLTextAreaElement | null) => {
                  if (el) {
                    textareaRefs.current[isEncrypt ? "encrypted" : "decrypt"] = el
                  }
                }, [isEncrypt])}
                value={isEncrypt ? state.text : decryptState.text}
                onChange={(e) => createStateHandler(type, "text")(e.target.value)}
                placeholder={`Enter text to ${type}`}
                className="font-sans bg-transparent border-gray-200"
              />
            </div>

            {/* Secret Key Input */}
            <div className="space-y-2">
              <Label>Your secret key:</Label>
              <Input
                value={state.key}
                onChange={(e) => createStateHandler(type, "key")(e.target.value)}
                placeholder="Enter secret key"
                className="font-sans bg-transparent border-gray-200"
              />
            </div>

            {/* Algorithm Selector */}
            <div className="space-y-2">
              <Label>Encryption algorithm:</Label>
              <Select
                value={state.algorithm}
                onValueChange={(value: Algorithm) => createStateHandler(type, "algorithm")(value)}
              >
                <SelectTrigger className="bg-transparent border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(cryptoOperations).map((algo) => (
                    <SelectItem key={algo} value={algo}>
                      {algo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Result Display */}
            <div className="space-y-2">
              <Label>{isEncrypt ? "Your text encrypted:" : "Your decrypted text:"}</Label>
              <Textarea
                value={state.result}
                readOnly
                className="font-sans bg-transparent border-gray-200"
              />
            </div>
          </CardContent>
        </Card>
      )
    },
    [encryptState, decryptState, cryptoOperations, createStateHandler]
  )

  return (
    <div className="min-h-screen p-6 lg:ml-[var(--sidebar-width)] flex justify-center">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">Encrypt / Decrypt Text</h1>
          
          <p className="mt-2 text-gray-500">
            Encrypt clear text and decrypt ciphertext using crypto algorithms like AES, TripleDES, Rabbit or RC4.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <CryptoCard type="encrypt" />
          <CryptoCard type="decrypt" />
        </div>
      </div>
    </div>
  )
}

