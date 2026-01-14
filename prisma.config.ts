import type { PrismaConfig } from '@prisma/client'

const config: PrismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
}

export default config