import { Injectable } from "@angular/core"
import { HTTPClient } from "../../../../application/ports/http-client"
import { FetchHTTPClient } from "../../../../infrastructure/ports/fetch.http-client"

@Injectable({ providedIn: "root" })
export class HTTPClientService implements HTTPClient {
    private readonly client: HTTPClient = new FetchHTTPClient()

    async get(url: URL): Promise<any> {
        return await this.client.get(url)
    }

    async post(url: URL, data: any): Promise<void> {
        return await this.client.post(url, data)
    }

    async postBlob(url: URL, data: any): Promise<Blob> {
        return await this.client.postBlob(url, data)
    }

    async delete(url: URL): Promise<void> {
        return await this.client.delete(url)
    }
}
