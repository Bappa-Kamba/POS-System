import 'dotenv/config';

interface PrismaCliConfig {
  schema: string;
  migrations?: {
    seed?: string;
  };
}

const config: PrismaCliConfig = {
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
};

export default config;
