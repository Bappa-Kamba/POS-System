"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const branches_module_1 = require("./modules/branches/branches.module");
const products_module_1 = require("./modules/products/products.module");
const variants_module_1 = require("./modules/variants/variants.module");
const sales_module_1 = require("./modules/sales/sales.module");
const reports_module_1 = require("./modules/reports/reports.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const audit_module_1 = require("./modules/audit/audit.module");
const settings_module_1 = require("./modules/settings/settings.module");
const prisma_module_1 = require("./prisma/prisma.module");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
const sessions_module_1 = require("./modules/sessions/sessions.module");
const subdivisions_module_1 = require("./modules/subdivisions/subdivisions.module");
const categories_module_1 = require("./modules/categories/categories.module");
const license_guard_1 = require("./modules/license/guards/license.guard");
const license_module_1 = require("./modules/license/license.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'client'),
            }),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                }),
                inject: [config_1.ConfigService],
            }),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            branches_module_1.BranchesModule,
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            variants_module_1.VariantsModule,
            sales_module_1.SalesModule,
            reports_module_1.ReportsModule,
            inventory_module_1.InventoryModule,
            expenses_module_1.ExpensesModule,
            audit_module_1.AuditModule,
            settings_module_1.SettingsModule,
            sessions_module_1.SessionsModule,
            subdivisions_module_1.SubdivisionsModule,
            categories_module_1.CategoriesModule,
            license_module_1.LicenseModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: license_guard_1.LicenseGuard,
            }
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map