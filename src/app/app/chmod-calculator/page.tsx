"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FileTerminal } from "lucide-react"

interface Permission {
  read: boolean
  write: boolean
  execute: boolean
}

interface Permissions {
  owner: Permission
  group: Permission
  public: Permission
}

export default function ChmodCalculator() {
  const [permissions, setPermissions] = useState<Permissions>({
    owner: { read: false, write: false, execute: false },
    group: { read: false, write: false, execute: false },
    public: { read: false, write: false, execute: false },
  })
  const [copied, setCopied] = useState(false)

  const calculateOctal = (permission: Permission): number => {
    return Number(permission.read) * 4 + Number(permission.write) * 2 + Number(permission.execute) * 1
  }

  const getChmodString = (): string => {
    const ownerOctal = calculateOctal(permissions.owner)
    const groupOctal = calculateOctal(permissions.group)
    const publicOctal = calculateOctal(permissions.public)
    return `${ownerOctal}${groupOctal}${publicOctal}`
  }

  const getSymbolicNotation = (): string => {
    const getPermissionString = (perm: Permission): string => {
      return `${perm.read ? "r" : "-"}${perm.write ? "w" : "-"}${perm.execute ? "x" : "-"}`
    }

    return [
      getPermissionString(permissions.owner),
      getPermissionString(permissions.group),
      getPermissionString(permissions.public),
    ].join("")
  }

  const handlePermissionChange = (userType: keyof Permissions, permType: keyof Permission, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [userType]: {
        ...prev[userType],
        [permType]: checked,
      },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
                  <FileTerminal className="h-5 w-5 text-primary" />
                </div>
                Chmod Calculator
              </CardTitle>
              <CardDescription className="mt-2">
                Compute your chmod permissions and commands with this online chmod calculator.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="p-2 w-1/4"></th>
                    <th className="p-2">Owner (u)</th>
                    <th className="p-2">Group (g)</th>
                    <th className="p-2">Public (o)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Read (4)", type: "read" },
                    { label: "Write (2)", type: "write" },
                    { label: "Execute (1)", type: "execute" },
                  ].map(({ label, type }) => (
                    <tr key={type} className="border-t">
                      <td className="p-2 font-medium">{label}</td>
                      {(["owner", "group", "public"] as const).map((userType) => (
                        <td key={`${userType}-${type}`} className="p-2">
                          <Checkbox
                            checked={permissions[userType][type as keyof Permission]}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(userType, type as keyof Permission, checked as boolean)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl font-mono text-primary">{getChmodString()}</div>
                <div className="text-2xl font-mono text-primary">{getSymbolicNotation()}</div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                  <code className="flex-1">chmod {getChmodString()} path</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(`chmod ${getChmodString()} path`)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

