#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function usage() {
    console.error('Usage: node scripts/supabase-csv-to-d1.js [--categories exports/categories.csv] [--products exports/products.csv] [--out d1-seed.sql]');
    process.exit(1);
}

function parseArgs(argv) {
    const args = argv.slice(2);
    const config = {
        categories: 'exports/categories.csv',
        products: 'exports/products.csv',
        out: 'd1-seed.sql',
    };

    for (let i = 0; i < args.length; i += 1) {
        const key = args[i];
        if (key === '--categories') {
            config.categories = args[++i];
        } else if (key === '--products') {
            config.products = args[++i];
        } else if (key === '--out') {
            config.out = args[++i];
        } else {
            usage();
        }
    }

    if (!config.categories || !config.products || !config.out) usage();
    return config;
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        const next = text[i + 1];

        if (inQuotes) {
            if (ch === '"' && next === '"') {
                value += '"';
                i += 1;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                value += ch;
            }
            continue;
        }

        if (ch === '"') {
            inQuotes = true;
        } else if (ch === ',') {
            row.push(value);
            value = '';
        } else if (ch === '\n') {
            row.push(value);
            rows.push(row);
            row = [];
            value = '';
        } else if (ch !== '\r') {
            value += ch;
        }
    }

    if (value || row.length) {
        row.push(value);
        rows.push(row);
    }

    if (rows.length === 0) return [];
    const headers = rows.shift().map(header => header.trim().replace(/^\uFEFF/, ''));
    return rows
        .filter(values => values.some(value => String(value).trim() !== ''))
        .map(values => {
            const record = {};
            headers.forEach((header, index) => {
                const raw = values[index] == null ? '' : values[index];
                record[header] = raw === '' || raw.toUpperCase() === 'NULL' ? null : raw;
            });
            return record;
        });
}

function readCsv(file) {
    const fullPath = path.resolve(file);
    if (!fs.existsSync(fullPath)) {
        console.error(`CSV file not found: ${fullPath}`);
        process.exit(1);
    }
    return parseCsv(fs.readFileSync(fullPath, 'utf8'));
}

function sqlString(value) {
    if (value == null) return 'NULL';
    return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? String(number) : String(fallback);
}

function boolNumber(value, fallback = 0) {
    if (value == null) return String(fallback);
    if (typeof value === 'boolean') return value ? '1' : '0';
    const text = String(value).trim().toLowerCase();
    if (['true', 't', '1', 'yes', 'y'].includes(text)) return '1';
    if (['false', 'f', '0', 'no', 'n'].includes(text)) return '0';
    return sqlNumber(value, fallback);
}

function toIsoText(value) {
    if (!value) return null;
    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2})?$/.test(text)) {
        return text.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
    }
    return text;
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
  ${boolNumber(row.con_hang, 1)},
  ${boolNumber(row.da_mua, 0)},
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

const config = parseArgs(process.argv);
const categories = readCsv(config.categories);
const products = readCsv(config.products);

const output = [
    '-- Generated from Supabase CSV exports for Cloudflare D1.',
    '-- Safe to rerun: rows are upserted by id.',
    'PRAGMA foreign_keys = ON;',
    ...categories.map(categorySql),
    ...products.map(productSql),
    '',
].join('\n\n');

fs.writeFileSync(path.resolve(config.out), output, 'utf8');
console.error(`Wrote ${categories.length} categories and ${products.length} products to ${config.out}`);
