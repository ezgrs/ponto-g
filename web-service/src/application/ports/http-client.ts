export interface HTTPClient {
    get(url: URL): Promise<any>
    post(url: URL, data: any): Promise<void>
    postBlob(url: URL, data: any): Promise<Blob>
    delete(url: URL): Promise<void>
}
