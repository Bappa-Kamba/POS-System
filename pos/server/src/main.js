"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const common_2 = require("@nestjs/common");
const utils_1 = require("./common/utils");
require("./mdns");
async function bootstrap() {
    const logger = new common_2.Logger('POS-Server');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        errorHttpStatusCode: 400,
    }));
    app.enableCors({
        origin: true,
        credentials: true,
    });
    const port = configService.get('PORT', 3000);
    await app.listen(port, '0.0.0.0');
    const lanIp = (0, utils_1.getLanIp)();
    logger.log(`Server running on: ${await app.getUrl()}`);
    if (lanIp) {
        logger.warn(`LAN fallback: http://${lanIp}:${port}`);
    }
}
bootstrap().catch((e) => console.log(`Error: ${JSON.stringify(e, null, 2)}`));
//# sourceMappingURL=main.js.map