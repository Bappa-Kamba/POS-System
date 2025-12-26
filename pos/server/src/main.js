"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const common_2 = require("@nestjs/common");
require("./mdns");
async function bootstrap() {
    const logger = new common_2.Logger('Main Application');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const apiPrefix = configService.get('API_PREFIX', 'api/v1');
    if (apiPrefix) {
        app.setGlobalPrefix(apiPrefix, { exclude: [''] });
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        errorHttpStatusCode: 400,
    }));
    const corsOrigin = configService.get('CORS_ORIGIN');
    app.enableCors({
        origin: [
            'http://pos-server.local',
            'http://pos-server.local:5173',
            'http://localhost:5173'
        ],
        credentials: true,
    });
    const port = configService.get('PORT', 3000);
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((e) => console.log(`Error: ${JSON.stringify(e, null, 2)}`));
//# sourceMappingURL=main.js.map