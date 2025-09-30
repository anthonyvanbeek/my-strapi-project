#!/usr/bin/env node
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { parseArgs } = require('node:util');

const ADMIN_URL_ENV = 'STRAPI_CLOUD_ADMIN_URL';
const TOKEN_ENV = 'STRAPI_CLOUD_TRANSFER_TOKEN';

const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

try {
  // Ensure local .env values are available when running through npm scripts.
  const dotenv = require('dotenv');
  dotenv.config({ path: envPath });
} catch (error) {
  // Dotenv ships with Strapi but provide a soft warning for unexpected setups.
  if (fs.existsSync(envPath)) {
    console.warn('Warning: unable to preload environment from backend/.env.');
    console.warn(`Reason: ${error.message}`);
  }
}

const adminUrlRaw = process.env[ADMIN_URL_ENV];
const tokenRaw = process.env[TOKEN_ENV];

if (!adminUrlRaw || !adminUrlRaw.trim()) {
  console.error(`Missing required environment variable ${ADMIN_URL_ENV}.`);
  console.error('Set it to the base Strapi Cloud admin URL, for example: https://your-project.cloud.strapi.io/admin');
  process.exit(1);
}

if (!tokenRaw || !tokenRaw.trim()) {
  console.error(`Missing required environment variable ${TOKEN_ENV}.`);
  console.error('Create a transfer token in the Strapi Cloud admin and export it before running this script.');
  process.exit(1);
}

const sanitizeUrl = (value) => value.trim().replace(/\/$/, '');
const normalizeAdminUrl = (value) => {
  const sanitized = sanitizeUrl(value);
  return sanitized.endsWith('/admin') ? sanitized : `${sanitized}/admin`;
};

const baseAdminUrl = normalizeAdminUrl(adminUrlRaw);


const parseCommaList = (value, flag) => {
  const segments = value.split(',').map((part) => part.trim()).filter(Boolean);
  if (!segments.length) {
    console.error(`Invalid value provided for ${flag}.`);
    process.exit(1);
  }
  return segments;
};

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    force: { type: 'boolean', default: true },
    verbose: { type: 'boolean', default: false },
    exclude: { type: 'string' },
    only: { type: 'string' },
    throttle: { type: 'string' },
  },
  allowPositionals: false,
});

const allowedDataTypes = Object.keys(require('@strapi/data-transfer').engine.TransferGroupPresets);

const validateDataTypes = (list, flag) => {
  const invalid = list.filter((item) => !allowedDataTypes.includes(item));
  if (invalid.length) {
    console.error(`Invalid value(s) provided for ${flag}: ${invalid.join(', ')}`);
    console.error(`Allowed values: ${allowedDataTypes.join(', ')}`);
    process.exit(1);
  }
  return list;
};

const throttle = values.throttle !== undefined ? Number(values.throttle) : undefined;
if (Number.isNaN(throttle)) {
  console.error('The --throttle option must be a number representing milliseconds.');
  process.exit(1);
}

const exclude = values.exclude ? validateDataTypes(parseCommaList(values.exclude, '--exclude'), '--exclude') : undefined;
const only = values.only ? validateDataTypes(parseCommaList(values.only, '--only'), '--only') : undefined;

let transferAction;

try {
  const strapiPackageJson = require.resolve('@strapi/strapi/package.json', {
    paths: [projectRoot],
  });
  const actionPath = path.join(path.dirname(strapiPackageJson), 'dist', 'src', 'cli', 'commands', 'transfer', 'action.js');
  transferAction = require(actionPath);
} catch (error) {
  console.error('Could not load Strapi transfer action.');
  console.error(`Reason: ${error.message}`);
  process.exit(1);
}

const run = async () => {
  console.log(`Starting Strapi data transfer from ${baseAdminUrl} to local environment...`);

  try {
    await transferAction({
      from: new URL(baseAdminUrl),
      fromToken: tokenRaw.trim(),
      force: values.force,
      verbose: values.verbose,
      exclude,
      only,
      throttle,
    });
    console.log('Strapi data transfer completed successfully.');
    process.exit(0);
  } catch (error) {
    if (error?.message?.includes('NODE_MODULE_VERSION')) {
      console.error('Data transfer failed because native modules were compiled for a different Node.js version.');
      console.error('Ensure you are running this script with a Node.js version supported by Strapi (>=18 <=20) and reinstall dependencies.');
    } else {
      console.error('Strapi data transfer failed.');
      console.error(error?.stack ?? error);
    }
    process.exit(1);
  }
};

run();
