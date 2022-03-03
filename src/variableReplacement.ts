import {
  API,
  FileInfo,
  Identifier,
  Literal,
  VariableDeclarator,
} from "jscodeshift";
import * as fs from "fs";
import { StringsFunctionFinder } from "./stringsFunctionFinder";

export const parser = "babel";

function filterVariableDeclarator(declaration: VariableDeclarator, names) {
  const init = declaration.init as Identifier;
  return init && init.name && names.has(init.name);
}

function filterVariableDeclarators(path, names) {
  return path.node.declarations.some((declaration) =>
    filterVariableDeclarator(declaration, names)
  );
}

function recurseVariables(root, j, functionNames: Set<String>): Set<String> {
  let foundVars = false;

  root
    .find(j.VariableDeclaration)
    .filter((path) => filterVariableDeclarators(path, functionNames))
    .forEach((path) => {
      const node = path.node;
      const filteredDecs = node.declarations.filter((declaration) =>
        filterVariableDeclarator(
          declaration as VariableDeclarator,
          functionNames
        )
      );
      filteredDecs.forEach((dec) => {
        const id = (dec as VariableDeclarator).id as Identifier;
        if (!functionNames.has(id.name)) {
          foundVars = true;
          functionNames.add(id.name);
        }
      });
    });

  if (foundVars) {
    recurseVariables(root, j, functionNames);
  }
  return functionNames;
}

export default function transformer(
  file: FileInfo,
  api: API,
  stringsFunctionFinder: StringsFunctionFinder
) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let initialFunction = new Set<String>();
  initialFunction.add(stringsFunctionFinder.originalName);

  console.info("Identifying variables...");
  let functionNames = recurseVariables(root, j, initialFunction);
  console.info(`Found ${functionNames.size} possible variable references...`);

  root
    .find(j.CallExpression)
    .filter((path) => {
      return (
        functionNames.has((path.node.callee as Identifier).name) &&
        path.node.arguments.length == 1
      );
    })
    .forEach((path) => {
      const varName = stringsFunctionFinder.getStringAt(
        (path.node.arguments[0] as Literal).value
      );
      j(path).replaceWith(j.literal(varName));
    });

  console.info("Writing to ./out.js");
  fs.writeFileSync("out.js", root.toSource());
}
