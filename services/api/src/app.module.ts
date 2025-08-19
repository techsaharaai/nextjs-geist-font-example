import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';

// Import modules
import { AuthModule } from './modules/auth/auth.module';
import { PassesModule } from './modules/passes/passes.module';
import { ScanModule } from './modules/scan/scan.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Import configuration
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { throttlerConfig } from './config/throttler.config';

// Import entities
import { Company } from './database/entities/company.entity';
import { ParkingLot } from './database/entities/parking-lot.entity';
import { Gate } from './database/entities/gate.entity';
import { User } from './database/entities/user.entity';
import { Vehicle } from './database/entities/vehicle.entity';
import { PassPlan } from './database/entities/pass-plan.entity';
import { Pass } from './database/entities/pass.entity';
import { ScanEvent } from './database/entities/scan-event.entity';
import { Payment } from './database/entities/payment.entity';
import { ReminderLog } from './database/entities/reminder-log.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [databaseConfig, jwtConfig, throttlerConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DATABASE_NAME', 'parknest_pro'),
        entities: [
          Company,
          ParkingLot,
          Gate,
          User,
          Vehicle,
          PassPlan,
          Pass,
          ScanEvent,
          Payment,
          ReminderLog,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
          limit: configService.get('RATE_LIMIT_MAX_REQUESTS', 100),
        },
      ],
      inject: [ConfigService],
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // JWT Global configuration
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    PassesModule,
    ScanModule,
    PaymentsModule,
    ReportsModule,
    AdminModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
