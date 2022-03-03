import { API, FileInfo } from "jscodeshift";
import { StringsFunctionFinder } from "./stringsFunctionFinder";
import variableReplacement from "./variableReplacement";

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  function isRootLevel(path) {
    return j.Program.check(path.parent.value);
  }

  // Root level functions
  const possibleStringFunctions = root
    .find(j.FunctionDeclaration)
    .filter((path) => isRootLevel(path));
  console.info(
    `Found ${possibleStringFunctions.length} possible string functions...`
  );

  // We could modify these paths back to self/window
  // But instead, we'll modify the strings of a different file.
  const replacedSelfPaths = [];
  root
    .find(j.Identifier)
    .filter((path) => path.node.name.toLowerCase() === "self")
    .forEach((path) => {
      replacedSelfPaths.push(path);
      j(path).replaceWith(j.identifier("global"));
    });

  const replacedWindowPaths = [];
  root
    .find(j.Identifier)
    .filter((path) => path.node.name.toLowerCase() === "window")
    .forEach((path) => {
      replacedWindowPaths.push(path);
      j(path).replaceWith(j.identifier("global"));
    });

  // Hack in global variable references so we can eval.
  let stage0Source = root.toSource();
  possibleStringFunctions.forEach((path) => {
    const name = path.node.id.name;
    stage0Source += `;global["${name}"] = ${name}`;
  });

  const funcNames = [];
  possibleStringFunctions.forEach((path) => {
    funcNames.push(path.node.id.name);
  });

  variableReplacement(
    file,
    api,
    new StringsFunctionFinder(stage0Source, funcNames)
  );
}
