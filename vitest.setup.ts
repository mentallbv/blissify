import { config } from 'dotenv'

// Integration tests must use the isolated local database and media store.
// `override` prevents an inherited production POSTGRES_URL from taking precedence.
config({ path: '.env.local', override: true })
