"use client"

import * as React from "react"
import { toast } from "sonner"

export interface EnvironmentVariable {
    id: string
    key: string
    value: string
    enabled: boolean
}

export interface Environment {
    id: string
    name: string
    variables: EnvironmentVariable[]
}

const STORAGE_KEY = "api-client-environments"
const ACTIVE_ENV_KEY = "api-client-active-environment"

export function useEnvironments() {
    const [environments, setEnvironments] = React.useState<Environment[]>([])
    const [activeEnvId, setActiveEnvId] = React.useState<string | null>(null)

    React.useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setEnvironments(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse environments", e)
            }
        } else {
            setEnvironments([
                {
                    id: crypto.randomUUID(),
                    name: "Global",
                    variables: []
                }
            ])
        }

        const storedActive = localStorage.getItem(ACTIVE_ENV_KEY)
        if (storedActive) {
            setActiveEnvId(storedActive)
        }
    }, [])

    React.useEffect(() => {
        if (environments.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(environments))
        }
    }, [environments])

    React.useEffect(() => {
        if (activeEnvId) {
            localStorage.setItem(ACTIVE_ENV_KEY, activeEnvId)
        } else {
            localStorage.removeItem(ACTIVE_ENV_KEY)
        }
    }, [activeEnvId])

    const addEnvironment = (name: string) => {
        const newEnv: Environment = {
            id: crypto.randomUUID(),
            name,
            variables: []
        }
        setEnvironments(prev => [...prev, newEnv])
        toast.success("Environment created")
        return newEnv.id
    }

    const updateEnvironment = (id: string, updates: Partial<Environment>) => {
        setEnvironments(prev => prev.map(env => env.id === id ? { ...env, ...updates } : env))
    }

    const deleteEnvironment = (id: string) => {
        setEnvironments(prev => prev.filter(env => env.id !== id))
        if (activeEnvId === id) {
            setActiveEnvId(null)
        }
        toast.success("Environment deleted")
    }

    const getActiveVariables = (): Record<string, string> => {
        if (!activeEnvId) return {}
        const env = environments.find(e => e.id === activeEnvId)
        if (!env) return {}

        return env.variables.reduce((acc, v) => {
            if (v.enabled && v.key) {
                acc[v.key] = v.value
            }
            return acc
        }, {} as Record<string, string>)
    }

    const substituteVariables = (text: string): string => {
        if (!text) return text
        const variables = getActiveVariables()
        return text.replace(/\{\{(.+?)\}\}/g, (match, key) => {
            return variables[key.trim()] || match
        })
    }

    return {
        environments,
        activeEnvId,
        setActiveEnvId,
        addEnvironment,
        updateEnvironment,
        deleteEnvironment,
        substituteVariables
    }
}
