#!/usr/bin/env node

var CPU = require("../lib/cpu"),
    fs = require("fs");

var cpu = new CPU().load(fs.readFileSync(process.argv[2])).start().run();

console.log(JSON.stringify(cpu, null, 2));
