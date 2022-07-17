import pgPromise from 'pg-promise';
import type {IDatabase} from "pg-promise";
import type {IClient} from "pg-promise/typescript/pg-subset";
const pgp = pgPromise()

const db = pgp({
    host: process.env.DB_IP,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 50
});




const CREATE_USER_TABLE = "CREATE TABLE IF NOT EXISTS $[table:name](" +
    "id SERIAL PRIMARY KEY," +
    "email VARCHAR(255) NOT NULL," +
    "name VARCHAR(255) NOT NULL," +
    "password VARCHAR(255) NOT NULL," +
    "account_creation DATE NOT NULL DEFAULT CURRENT_DATE," +
    "discordId VARCHAR(255)," +
    "avatarId VARCHAR(50)," +
    "bioText TEXT," +
    "memberStart DATE," +
    "memberStop DATE" +
    ")"

const CREATE_COOKIE_TABLE = "CREATE TABLE IF NOT EXISTS $[table:name](" +
    "email VARCHAR(255) PRIMARY KEY NOT NULL," +
    "cookieId VARCHAR(255) NOT NULL" +
    ")"

async function init(db: IDatabase<unknown, IClient>) {
    await db.none(CREATE_USER_TABLE, {
        table: "users"
    })
    await db.none(CREATE_COOKIE_TABLE, {
        table: "cookies"
    })
}

await init(db)
export {db}