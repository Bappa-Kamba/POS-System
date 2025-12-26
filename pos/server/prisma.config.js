"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config = {
    schema: './prisma/schema.prisma',
    migrations: {
        seed: 'ts-node prisma/seed.ts',
    },
};
exports.default = config;
//# sourceMappingURL=prisma.config.js.map