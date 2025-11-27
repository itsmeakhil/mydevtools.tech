import { ApiClient } from "@/components/api-client/api-client"

export const metadata = {
    title: "API Client | MyDevTools",
    description: "A powerful HTTP client for testing APIs",
}

export default function ApiClientPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">API Client</h1>
                <p className="text-muted-foreground">
                    Test and debug your APIs with a powerful HTTP client.
                </p>
            </div>
            <ApiClient />
        </div>
    )
}
