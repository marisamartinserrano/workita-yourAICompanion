import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
import * as schema from './schema.js'

const { Pool } = pkg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
