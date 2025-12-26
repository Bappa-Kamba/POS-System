import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BranchesModule } from './modules/branches/branches.module';
import { ProductsModule } from './modules/products/products.module';
import { VariantsModule } from './modules/variants/variants.module';
import { SalesModule } from './modules/sales/sales.module';
import { ReportsModule } from './modules/reports/reports.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AuditModule } from './modules/audit/audit.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SubdivisionsModule } from './modules/subdivisions/subdivisions.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LicenseGuard } from './modules/license/guards/license.guard';
import { LicenseModule } from './modules/license/license.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'client'),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    UsersModule,
    BranchesModule,
    AuthModule,
    ProductsModule,
    VariantsModule,
    SalesModule,
    ReportsModule,
    InventoryModule,
    ExpensesModule,
    AuditModule,
    SettingsModule,
    SessionsModule,
    SubdivisionsModule,
    CategoriesModule,
    LicenseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: LicenseGuard,
    }
  ],
})
export class AppModule {}
