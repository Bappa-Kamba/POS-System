export declare class AppController {
    constructor();
    getEndpoint(): {
        mdns: string;
        ip: string | null;
        port: number;
        apiBase: string;
    };
    health(): {
        status: string;
    };
}
