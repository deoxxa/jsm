var Concentrate = require("concentrate"),
    parser = require("./parser");

var codes = require("./codes");

var Assembler = module.exports = function Assembler() {
  this.currentOffset = 0;
  this.labels = {};
  this.transformations = [
    this.computeOffsets,
    this.recordLabelPositions,
    this.evaluateExpressions,
  ];
};

Assembler.prototype.statementSize = function statementSize(statement) {
  switch (statement.keyword) {
    case "SET": return 6;
    case "CPY": return 3;
    case "DRB": return 3;
    case "DWB": return 3;
    case "SRB": return 6;
    case "SWB": return 6;
    case "ADD": return 4;
    case "AND": return 4;
    case "OR":  return 4;
    case "XOR": return 4;
    case "JMP": return 5;
    case "JNE": return 7;
    case "END": return 1;
    case "str": return statement.parameters[0].text.length;
    case "hex": return statement.parameters[0].text.length / 2;
    case "buf": return statement.parameters[0].number;
    default:    return 0;
  }
};

Assembler.prototype.evaluateExpression = function evaluateExpression(expression) {
  var self = this;

  var resolved = expression.parts.map(function(e) {
    if (e.type === "expression") {
      return self.evaluateExpression(e);
    } else if (e.type === "label") {
      return {
        type: "number",
        number: self.labels[e.label],
      };
    } else {
      return e;
    }
  });

  var number = null,
      currentOperator = null;

  for (var i=0;i<resolved.length;++i) {
    if (i === 0 && resolved[i].type === "number") {
      number = resolved[i].number;
    } else if (!currentOperator && resolved[i].type === "operator") {
      currentOperator = resolved[i].operator;
    } else if (currentOperator === "+") {
      number += resolved[i].number;
    } else if (currentOperator === "-") {
      number -= resolved[i].number;
    } else {
      throw new Error("invalid expression encountered");
    }
  }

  if (number === null) {
    throw new Error("couldn't evaluate expression for some reason");
  }

  return {
    type: "number",
    number: number,
  };
};

Assembler.prototype.computeOffsets = function computeOffsets(ast) {
  for (var i=0;i<ast.length;++i) {
    ast[i].offset = this.currentOffset;

    if (ast[i].statement) {
      this.currentOffset += this.statementSize(ast[i].statement);
    }
  }
};

Assembler.prototype.recordLabelPositions = function recordLabelPositions(ast) {
  for (var i=0;i<ast.length;++i) {
    if (ast[i].statement && ast[i].statement.type === "label") {
      this.labels[ast[i].statement.label] = ast[i].offset;
    }
  }
};

Assembler.prototype.evaluateExpressions = function evaluateExpressions(ast) {
  for (var i=0;i<ast.length;++i) {
    if (ast[i].statement && ast[i].statement.parameters) {
      for (var j=0;j<ast[i].statement.parameters.length;++j) {
        if (ast[i].statement.parameters[j].type === "expression") {
          ast[i].statement.parameters[j] = this.evaluateExpression(ast[i].statement.parameters[j]);
        }
      }
    }
  }
};

Assembler.prototype.assemble = function assemble(ast) {
  if (Buffer.isBuffer(ast)) {
    ast = ast.toString();
  }

  if (typeof ast === "string") {
    ast = parser.parse(ast);
  }

  return this.serialise(ast);
};

Assembler.prototype.serialise = function serialise(ast) {
  ast = JSON.parse(JSON.stringify(ast));

  for (var i=0;i<this.transformations.length;++i) {
    this.transformations[i].call(this, ast);
  }

  var serialiser = new Concentrate();

  ast.map(function(node) {
    return node.statement;
  }).filter(function(statement) {
    return statement && statement.type !== "label";
  }).forEach(function(statement) {
    switch (statement.keyword) {
      case "NOP": {
        serialiser.uint8(codes.NOP);
      }
      case "SET": {
        serialiser.uint8(codes.SET);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint32be(statement.parameters[1].number);
        break;
      }
      case "CPY": {
        serialiser.uint8(codes.CPY);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint8(statement.parameters[1].number);
        break;
      }
      case "DRB": {
        serialiser.uint8(codes.DRB);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint8(statement.parameters[1].number);
        break;
      }
      case "DWB": {
        serialiser.uint8(codes.DWB);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint8(statement.parameters[1].number);
        break;
      }
      case "SRB": {
        serialiser.uint8(codes.SRB);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint32be(statement.parameters[1].number);
        break;
      }
      case "SWB": {
        serialiser.uint8(codes.SWB);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint32be(statement.parameters[1].number);
        break;
      }
      case "ADD": {
        serialiser.uint8(codes.ADD);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint8(statement.parameters[1].number);
        serialiser.uint8(statement.parameters[2].number);
        break;
      }
      case "MUL": {
        serialiser.uint8(codes.MUL);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint8(statement.parameters[1].number);
        serialiser.uint8(statement.parameters[2].number);
        break;
      }
      case "AND": {
        serialiser.uint8(codes.AND);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint8(statement.parameters[1].number);
        serialiser.uint8(statement.parameters[2].number);
        break;
      }
      case "OR": {
        serialiser.uint8(codes.OR);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint8(statement.parameters[1].number);
        serialiser.uint8(statement.parameters[2].number);
        break;
      }
      case "XOR": {
        serialiser.uint8(codes.XOR);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint8(statement.parameters[1].number);
        serialiser.uint8(statement.parameters[2].number);
        break;
      }
      case "JMP": {
        serialiser.uint8(codes.JMP);
        serialiser.uint32be(statement.parameters[0].number);
        break;
      }
      case "JNE": {
        serialiser.uint8(codes.JNE);
        serialiser.uint8(statement.parameters[0].number);
        serialiser.uint8(statement.parameters[1].number);
        serialiser.uint32be(statement.parameters[2].number);
        break;
      }
      case "END": {
        serialiser.uint8(codes.END);
        break;
      }
      case "str": {
        serialiser.buffer(statement.parameters[0].text);
        break;
      }
      case "hex": {
        serialiser.buffer(Buffer(statement.parameters[0].text, "hex"));
        break;
      }
      case "buf": {
        serialiser.buffer(Buffer(statement.parameters[0].number));
        break;
      }
    }
  });

  return serialiser.result();
};
