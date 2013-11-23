var codes = require("./codes");

var CPU = module.exports = function CPU(options) {
  options = options || {};

  this.ticks = 0;
  this.eip = 0;
  this.running = false;

  this.registers = new Int32Array(options.registers || 8);
  this.memory = null;
};

CPU.prototype.toJSON = function toJSON() {
  return {
    ticks: this.ticks,
    eip: this.eip,
    registers: [].slice.call(this.registers),
    memory: [].slice.call(this.memory),
  };
};

CPU.prototype.start = function start() {
  this.ticks = 0;
  this.eip = 0;

  for (var i=0;i<this.registers.length;++i) {
    this.registers[i] = 0;
  }

  this.running = true;

  return this;
};

CPU.prototype.load = function load(memory) {
  var _memory = new ArrayBuffer(memory.length);

  for (var i=0;i<memory.length;++i) {
    _memory[i] = memory[i];
  }

  this.memory = new DataView(_memory);

  return this;
};

CPU.prototype.tick = function tick() {
  this.ticks++;

  switch (this.memory[this.eip]) {
    case codes.NOP: {
      this.eip += 1;
      break;
    }
    case codes.SET: {
      this.registers[this.memory[this.eip + 1]] = this.memory.getUint32(this.eip + 2);
      this.eip += 6;
      break;
    }
    case codes.CPY: {
      this.registers[this.memory[this.eip + 1]] = this.registers[this.memory[this.eip + 2]];
      this.eip += 3;
      break;
    }
    case codes.DRB: {
      this.registers[this.memory[this.eip + 1]] = this.memory.getUint8(this.registers[this.memory[this.eip + 2]]);
      this.eip += 3;
      break;
    }
    case codes.DWB: {
      this.memory.setUint8(this.registers[this.memory[this.eip + 2]], this.registers[this.memory[this.eip + 1]]);
      this.eip += 3;
      break;
    }
    case codes.SRB: {
      this.registers[this.memory[this.eip + 1]] = this.memory.getUint8(this.memory[this.eip + 2]);
      this.eip += 6;
      break;
    }
    case codes.SWB: {
      this.memory.setUint8(this.memory[this.eip + 2], this.registers[this.memory[this.eip + 1]]);
      this.eip += 6;
      break;
    }
    case codes.ADD: {
      this.registers[this.memory[this.eip + 1]] = this.registers[this.memory[this.eip + 2]] + this.registers[this.memory[this.eip + 3]];
      this.eip += 4;
      break;
    }
    case codes.MUL: {
      this.registers[this.memory[this.eip + 1]] = this.registers[this.memory[this.eip + 2]] * this.registers[this.memory[this.eip + 3]];
      this.eip += 4;
      break;
    }
    case codes.AND: {
      this.registers[this.memory[this.eip + 1]] = this.registers[this.memory[this.eip + 2]] & this.registers[this.memory[this.eip + 3]];
      this.eip += 4;
      break;
    }
    case codes.OR: {
      this.registers[this.memory[this.eip + 1]] = this.registers[this.memory[this.eip + 2]] | this.registers[this.memory[this.eip + 3]];
      this.eip += 4;
      break;
    }
    case codes.XOR: {
      this.registers[this.memory[this.eip + 1]] = this.registers[this.memory[this.eip + 2]] ^ this.registers[this.memory[this.eip + 3]];
      this.eip += 4;
      break;
    }
    case codes.JMP: {
      this.eip = this.memory.getUint32(this.eip + 1);
      break;
    }
    case codes.JNE: {
      if (this.registers[this.memory[this.eip + 1]] !== this.registers[this.memory[this.eip + 2]]) {
        this.eip = this.memory.getUint32(this.eip + 3);
      } else {
        this.eip += 7;
      }
      break;
    }
    case codes.END: {
      this.running = false;
      break;
    }
  }

  return this.running;
};

CPU.prototype.run = function run() {
  do {
    var rc = this.tick();
  } while (rc);

  return this;
};
