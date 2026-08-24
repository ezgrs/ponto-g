import { HTTPClient } from "../../application/ports/http-client"

export class FetchHTTPClient implements HTTPClient {
    async get(url: URL): Promise<any> {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
        return await response.json()
    }

    async post(url: URL, data: any): Promise<void> {
        const response = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
    }

    async postBlob(url: URL, data: any): Promise<Blob> {
        const response = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
        return await response.blob()
    }

    async delete(url: URL): Promise<void> {
        const response = await fetch(url, {method: "DELETE"})
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
    }
}
