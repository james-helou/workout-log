import { config } from 'dotenv'

config({ path: '.env.local' })

const test = process.env.TEST_DATABASE_URL
const main = process.env.DATABASE_URL

if (test && main && test === main) {
  throw new Error(
    'TEST_DATABASE_URL equals DATABASE_URL. Integration tests truncate tables. Refusing to run.',
  )
}
