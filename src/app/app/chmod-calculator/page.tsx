"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

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
    <div className="p-4 bg-background mt-3">
      <Card className="w-full max-w-3xl p-6 space-y-6 relative shadow-sm mx-auto">
        <Button variant="ghost" size="icon" className="absolute right-4 top-4">
          <Heart className="h-5 w-5" />
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Chmod calculator</h1>
          <p className="text-muted-foreground">
            Compute your chmod permissions and commands with this online chmod calculator.
          </p>
        </div>

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
      </Card>
    </div>
  )
}

