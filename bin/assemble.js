#!/usr/bin/env node

var Assembler = require("../lib/assembler"),
    fs = require("fs");

var input = process.stdin,
    output = process.stdout;

if (process.argv[2] && process.argv[2] !== "-") {
  input = fs.createReadStream(process.argv[2]);
}

if (process.argv[3] && process.argv[3] !== "-") {
  output = fs.createWriteStream(process.argv[3]);
}

var inputData = [];
input.on("data", function(chunk) {
  inputData.push(chunk);
});

input.on("end", function() {
  var data = Buffer.concat(inputData);

  var assembler = new Assembler();

  var binary = assembler.assemble(data);

  output.write(binary);
});
