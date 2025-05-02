#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { createServer } = require('./server');

const argv = yargs(hideBin(process.argv))
  .option('port', {
    alias: 'p',
    type: 'number',
    description: 'Port to run the MCP server on',
    default: 3000
  })
  .option('hostname', {
     alias: 'h',
     type: 'string',
     description: 'Hostname to bind the server to',
     default: 'localhost'
  })
  .help()
  .alias('help', '?')
  .argv;

createServer(argv.port, argv.hostname); 