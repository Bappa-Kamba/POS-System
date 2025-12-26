// module.exports = {
//   seed: {
//     run: 'node prisma/seed.js',
//   },
// };

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
    seed: 'node prisma/seed.js',
  },
};

export default config;

