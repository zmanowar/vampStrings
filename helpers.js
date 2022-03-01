const fs = require("fs");
const esprima = require("esprima");
const escodegen = require("escodegen");

function getAllFunctionsFromFile(filename) {
  const rawTextFromThisFile = fs.readFileSync(filename, "utf8");
  const parsed = esprima.parseScript(rawTextFromThisFile);
  const allDeclaredVariables = parsed.body.filter(
    (e) => e.type === "VariableDeclaration"
  );
  const allDeclaredFunctions = parsed.body.filter(
    (e) => e.type === "FunctionDeclaration"
  );

  let allFunctions = [];
  for (declaredVariable of allDeclaredVariables) {
    const declarations = declaredVariable.declarations[0];
    if (declarations.init.type === "ArrowFunctionExpression") {
      const anonymousFunction = declarations.init;
      let reconstructedFunction = anonymousFunction;
      reconstructedFunction.id = declarations.id;
      allFunctions.push(reconstructedFunction);
    }
  }
  allFunctions.push(...allDeclaredFunctions);

  let functionsDict = {};
  for (parsedFunction of allFunctions) {
    const functionString = escodegen.generate(parsedFunction);
    const newFunction = eval(`(${functionString})`);
    functionsDict[parsedFunction.id.name] = newFunction;
  }
  return functionsDict;
}

module.exports = {
  getAllFunctionsFromFile,
};
