#!/usr/bin/env node

const crypto = require('crypto');

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_HASH_BYTES = 32;

function usage() {
    console.error('Usage: node scripts/create-user.js <email> <password>');
    console.error('Requires PASSWORD_PEPPER in the environment.');
    process.exit(1);
}

function sqlString(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}

const [, , rawEmail, password] = process.argv;
const email = String(rawEmail || '').trim().toLowerCase();
const pepper = process.env.PASSWORD_PEPPER || '';

if (!email || !password || !pepper) usage();

const id = crypto.randomUUID();
const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(
    `${password}${pepper}`,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_HASH_BYTES,
    'sha256'
);

const now = new Date().toISOString();

console.log(`INSERT INTO users (id, email, password_hash, password_salt, created_at)
VALUES (${sqlString(id)}, ${sqlString(email)}, ${sqlString(hash.toString('base64'))}, ${sqlString(salt.toString('base64'))}, ${sqlString(now)})
ON CONFLICT(email) DO UPDATE SET
  password_hash = excluded.password_hash,
  password_salt = excluded.password_salt;`);
