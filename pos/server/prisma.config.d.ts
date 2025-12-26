import 'dotenv/config';
interface PrismaCliConfig {
    schema: string;
    migrations?: {
        seed?: string;
    };
}
declare const config: PrismaCliConfig;
export default config;
