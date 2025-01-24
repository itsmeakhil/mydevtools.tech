"use client"

import * as CryptoJS from "crypto-js"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card"

type Algorithm = "AES" | "TripleDES" | "Rabbit" | "RC4"

export default function EncryptDecrypt() {
  const defaultText = "Lorem ipsum dolor sit amet"
  const defaultKey = "my secret key"
  
  const [plainText, setPlainText] = useState(defaultText)
  const [encryptKey, setEncryptKey] = useState(defaultKey)
  const [encryptedText, setEncryptedText] = useState("")
  const [textToDecrypt, setTextToDecrypt] = useState("")
  const [decryptKey, setDecryptKey] = useState(defaultKey)
  const [decryptedText, setDecryptedText] = useState("")
  const [encryptAlgo, setEncryptAlgo] = useState<Algorithm>("AES")
  const [decryptAlgo, setDecryptAlgo] = useState<Algorithm>("AES")

  useEffect(() => {
    const encrypted = CryptoJS.AES.encrypt(defaultText, defaultKey).toString()
    setEncryptedText(encrypted)
    setTextToDecrypt(encrypted)
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, defaultKey)
    const result = decrypted.toString(CryptoJS.enc.Utf8)
    setDecryptedText(result || "Decryption failed")
  }, [])

  const encrypt = (text: string, key: string, algorithm: Algorithm) => {
    try {
      let encrypted
      switch (algorithm) {
        case "AES":
          encrypted = CryptoJS.AES.encrypt(text, key).toString()
          break
        case "TripleDES":
          encrypted = CryptoJS.TripleDES.encrypt(text, key).toString()
          break
        case "Rabbit":
          encrypted = CryptoJS.Rabbit.encrypt(text, key).toString()
          break
        case "RC4":
          encrypted = CryptoJS.RC4.encrypt(text, key).toString()
          break
        default:
          encrypted = ""
      }
      setEncryptedText(encrypted)
    } catch (error) {
      console.error("Encryption error:", error)
      setEncryptedText("Encryption failed")
    }
  }

  const decrypt = (encrypted: string, key: string, algorithm: Algorithm) => {
    try {
      let decrypted
      switch (algorithm) {
        case "AES":
          decrypted = CryptoJS.AES.decrypt(encrypted, key)
          break
        case "TripleDES":
          decrypted = CryptoJS.TripleDES.decrypt(encrypted, key)
          break
        case "Rabbit":
          decrypted = CryptoJS.Rabbit.decrypt(encrypted, key)
          break
        case "RC4":
          decrypted = CryptoJS.RC4.decrypt(encrypted, key)
          break
        default:
          decrypted = ""
          return
      }
      const result = decrypted.toString(CryptoJS.enc.Utf8)
      setDecryptedText(result || "Decryption failed")
    } catch (error) {
      console.error("Decryption error:", error)
      setDecryptedText("Decryption failed")
    }
  }

  return (
    <div className="min-h-screen p-6 lg:ml-[var(--sidebar-width)] flex justify-center ">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-gray-900">Encrypt / decrypt text</h1>
          <p className="mt-2 text-gray-500">
            Encrypt clear text and decrypt ciphertext using crypto algorithms like AES, TripleDES, Rabbit or RC4.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Encrypt Section */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Encrypt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your text:</Label>
                <Textarea
                  value={plainText}
                  onChange={(e) => {
                    setPlainText(e.target.value)
                    encrypt(e.target.value, encryptKey, encryptAlgo)
                  }}
                  placeholder="Enter text to encrypt"
                  className="font-mono bg-gray-50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Your secret key:</Label>
                <Input
                  value={encryptKey}
                  onChange={(e) => {
                    setEncryptKey(e.target.value)
                    encrypt(plainText, e.target.value, encryptAlgo)
                  }}
                  placeholder="Enter secret key"
                  className="font-mono bg-gray-50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Encryption algorithm:</Label>
                <Select
                  value={encryptAlgo}
                  onValueChange={(value: Algorithm) => {
                    setEncryptAlgo(value)
                    encrypt(plainText, encryptKey, value)
                  }}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES">AES</SelectItem>
                    <SelectItem value="TripleDES">TripleDES</SelectItem>
                    <SelectItem value="Rabbit">Rabbit</SelectItem>
                    <SelectItem value="RC4">RC4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Your text encrypted:</Label>
                <Textarea value={encryptedText} readOnly className="font-mono bg-gray-50 border-gray-200" />
              </div>
            </CardContent>
          </Card>

          {/* Decrypt Section */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Decrypt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your encrypted text:</Label>
                <Textarea
                  value={textToDecrypt}
                  onChange={(e) => {
                    setTextToDecrypt(e.target.value)
                    decrypt(e.target.value, decryptKey, decryptAlgo)
                  }}
                  placeholder="Enter text to decrypt"
                  className="font-mono bg-gray-50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Your secret key:</Label>
                <Input
                  value={decryptKey}
                  onChange={(e) => {
                    setDecryptKey(e.target.value)
                    decrypt(textToDecrypt, e.target.value, decryptAlgo)
                  }}
                  placeholder="Enter secret key"
                  className="font-mono bg-gray-50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label>Encryption algorithm:</Label>
                <Select
                  value={decryptAlgo}
                  onValueChange={(value: Algorithm) => {
                    setDecryptAlgo(value)
                    decrypt(textToDecrypt, decryptKey, value)
                  }}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES">AES</SelectItem>
                    <SelectItem value="TripleDES">TripleDES</SelectItem>
                    <SelectItem value="Rabbit">Rabbit</SelectItem>
                    <SelectItem value="RC4">RC4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Your decrypted text:</Label>
                <Textarea value={decryptedText} readOnly className="font-mono bg-gray-50 border-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

