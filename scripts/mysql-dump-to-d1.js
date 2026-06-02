#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function usage() {
    console.error('Usage: node scripts/mysql-dump-to-d1.js [input.sql] [--out output.sql] [--transaction]');
    process.exit(1);
}

function parseArgs(argv) {
    const args = argv.slice(2);
    let input = 'shop_db.sql';
    let out = '';
    let transaction = false;

    for (let i = 0; i < args.length; i += 1) {
        if (args[i] === '--out') {
            out = args[i + 1] || '';
            i += 1;
        } else if (args[i] === '--transaction') {
            transaction = true;
        } else if (!args[i].startsWith('--')) {
            input = args[i];
        } else {
            usage();
        }
    }

    return { input, out, transaction };
}

function sqlString(value) {
    if (value == null) return 'NULL';
    return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? String(number) : String(fallback);
}

function toIsoText(value) {
    if (!value) return null;
    const text = String(value).trim();
    if (!text || text.toUpperCase() === 'NULL') return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) {
        return `${text.replace(' ', 'T')}.000Z`;
    }
    return text;
}

function findInsertBlock(sql, tableName) {
    const pattern = new RegExp(
        `INSERT\\s+INTO\\s+\`${tableName}\`\\s*\\(([^)]*)\\)\\s*VALUES\\s*([\\s\\S]*?);`,
        'i'
    );
    const match = sql.match(pattern);
    if (!match) return null;
    return {
        columns: match[1].split(',').map(col => col.replace(/[`"' ]/g, '').trim()),
        values: match[2],
    };
}

function parseTuples(valuesSql) {
    const tuples = [];
    let tuple = null;
    let token = '';
    let inString = false;

    for (let i = 0; i < valuesSql.length; i += 1) {
        const ch = valuesSql[i];
        const next = valuesSql[i + 1];

        if (inString) {
            if (ch === "'" && next === "'") {
                token += "'";
                i += 1;
            } else if (ch === "'" && next === "\\") {
                token += "'";
                i += 1;
            } else if (ch === "\\") {
                token += next || '';
                i += 1;
            } else if (ch === "'") {
                inString = false;
            } else {
                token += ch;
            }
            continue;
        }

        if (ch === "'") {
            inString = true;
            continue;
        }
        if (ch === '(') {
            tuple = [];
            token = '';
            continue;
        }
        if (ch === ',' && tuple) {
            tuple.push(normalizeToken(token));
            token = '';
            continue;
        }
        if (ch === ')' && tuple) {
            tuple.push(normalizeToken(token));
            tuples.push(tuple);
            tuple = null;
            token = '';
            continue;
        }
        if (tuple) token += ch;
    }

    return tuples;
}

function normalizeToken(token) {
    const text = token.trim();
    if (!text || text.toUpperCase() === 'NULL') return null;
    return text;
}

function rowsFor(sql, tableName) {
    const block = findInsertBlock(sql, tableName);
    if (!block) return [];
    return parseTuples(block.values).map(tuple => {
        const row = {};
        block.columns.forEach((column, index) => {
            row[column] = tuple[index] == null ? null : tuple[index];
        });
        return row;
    });
}

function categorySql(row) {
    return `INSERT INTO categories (id, ten_danh_muc)
VALUES (${sqlString(String(row.id))}, ${sqlString(row.ten_danh_muc)})
ON CONFLICT(id) DO UPDATE SET
  ten_danh_muc = excluded.ten_danh_muc;`;
}

function productSql(row) {
    return `INSERT INTO products (
  id, category_id, ten_san_pham, gia, so_luong, con_hang, da_mua,
  hinh_san_pham, ten_nhan_vat, shop_ban, nguoi_mua, ngay_mua, ngay_them
)
VALUES (
  ${sqlString(String(row.id))},
  ${row.category_id == null ? 'NULL' : sqlString(String(row.category_id))},
  ${sqlString(row.ten_san_pham)},
  ${sqlNumber(row.gia)},
  ${sqlNumber(row.so_luong, 1)},
  ${sqlNumber(row.con_hang, 1)},
  ${sqlNumber(row.da_mua, 0)},
  ${sqlString(row.hinh_san_pham)},
  ${sqlString(row.ten_nhan_vat)},
  ${sqlString(row.shop_ban || '')},
  ${sqlString(row.nguoi_mua)},
  ${sqlString(toIsoText(row.ngay_mua))},
  ${sqlString(toIsoText(row.ngay_them) || new Date().toISOString())}
)
ON CONFLICT(id) DO UPDATE SET
  category_id = excluded.category_id,
  ten_san_pham = excluded.ten_san_pham,
  gia = excluded.gia,
  so_luong = excluded.so_luong,
  con_hang = excluded.con_hang,
  da_mua = excluded.da_mua,
  hinh_san_pham = excluded.hinh_san_pham,
  ten_nhan_vat = excluded.ten_nhan_vat,
  shop_ban = excluded.shop_ban,
  nguoi_mua = excluded.nguoi_mua,
  ngay_mua = excluded.ngay_mua,
  ngay_them = excluded.ngay_them;`;
}

const { input, out, transaction } = parseArgs(process.argv);
const inputPath = path.resolve(input);
if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
}

const sql = fs.readFileSync(inputPath, 'utf8');
const categories = rowsFor(sql, 'categories');
const products = rowsFor(sql, 'products');

const statements = [
    '-- Generated from MySQL dump for Cloudflare D1.',
    '-- Safe to rerun: rows are upserted by id.',
    'PRAGMA foreign_keys = ON;',
    ...categories.map(categorySql),
    ...products.map(productSql),
    '',
];

if (transaction) {
    statements.splice(3, 0, 'BEGIN TRANSACTION;');
    statements.splice(statements.length - 1, 0, 'COMMIT;');
}

const output = statements.join('\n\n');

if (out) {
    fs.writeFileSync(path.resolve(out), output, 'utf8');
    console.error(`Wrote ${categories.length} categories and ${products.length} products to ${out}`);
} else {
    process.stdout.write(output);
}
