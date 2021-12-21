#!/usr/bin/env node

const docpkg = require('./');
const yargs = require('yargs/yargs');

const argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 [options]')
  .example(
    '$0 -r registry.my.com -l',
    'build a container and publish it to the specified registry'
  )
  .option('p', {
    alias: 'package',
    describe:
      'The path to the package.json or the directory where it is located',
    type: 'string',
  })
  .option('n', {
    alias: 'name',
    describe: 'Container name',
    type: 'string',
  })
  .option('r', {
    alias: 'registry',
    describe: 'Registry name to push container',
    type: 'string',
  })
  .option('V', {
    alias: 'version-tag',
    describe: 'Container version to build and publish',
    type: 'string',
  })
  .option('l', {
    alias: 'latest',
    default: false,
    describe: 'Push also latest tag',
    type: 'boolean',
  })
  .option('d', {
    alias: 'dockerfile',
    default: './Dockerfile',
    describe: 'Path to Dockerfile',
    type: 'string',
  })
  .help('h')
  .alias('h', 'help').argv;

docpkg(argv);
