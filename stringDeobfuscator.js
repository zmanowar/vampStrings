const fs = require("fs");
const beautify = require('js-beautify').js;

const { getAllFunctionsFromFile } = require("./helpers.js");

const stage0 = (bundlePath) => {
  let data = fs.readFileSync(bundlePath, {
    encoding: "utf-8",
    flag: "r",
  });

  data = beautify(data);
  // Cheesy replace for eval fix
  fs.writeFileSync(
    "stages/stage0.js",
    data.replace(/self\[/gmi, "window[").replace(/window\[/gmi, "global[")
  );

  const windowLevelFunctions = getAllFunctionsFromFile(bundlePath);
  console.info("Stage 0 Complete: Re-wrote window references...");
  stage1(windowLevelFunctions);
};

const stage1 = (availableFunctions) => {
  eval(fs.readFileSync("./stages/stage0.js") + "");
  let getStringAt;
  let getStringAtFuncHex;
  for (const funcName in availableFunctions) {
    // TODO: Don't hardcode this offset
    const returns = eval(`${funcName}(0xa1b)`);
    if (returns instanceof Array) {
      console.info("Found list of strings...");
    } else {
      getStringAtFuncHex = funcName;
      getStringAt = eval(`${funcName}`);
      break;
    }
  }

  console.info("Stage 1 Complete: Found string references...");

  stage2(getStringAt, getStringAtFuncHex);
};

const stage2 = (getStringAt, funcName) => {
  // This is incredibly gross, we need a few passes due to some circular renaming.

  const data = fs.readFileSync("./stages/stage0.js", {
    encoding: "utf-8",
    flag: "r",
  });
  hexRefs = [];

  let newData = data.replace(
    new RegExp(`(?<=var )(.*)(?= \= ${funcName})`, 'gmi'),
    (i, match) => {
      hexRefs.push(match);
      return "getStringAt";
    }
  );

  newData = newData.replace(
    new RegExp(`(?<=var )(.*)(?= \= getStringAt)`, 'gmi'),
    (i, match) => {
      hexRefs.push(match);
      return "getStringAt";
    }
  );

  hexRefs.forEach((hex) => {
    newData = newData.replace(new RegExp(hex, 'gmi'), "getStringAt");
  });

  newData = newData.replace(
    new RegExp(`(?<=var )(.*)(?= \= getStringAt)`, 'gmi'),
    (i, match) => {
      hexRefs.push(match);
      return "getStringAt";
    }
  );

  hexRefs.forEach((hex) => {
    newData = newData.replace(new RegExp(hex, "gi"), "getStringAt");
  });

  fs.writeFileSync("stages/stage2.js", newData);
  console.info("Stage 2 Complete: Replaced hex variables as getStringAt...");
  stage3(getStringAt);
};

const stage3 = (getStringAt) => {
  const data = fs.readFileSync("stages/stage2.js", {
    encoding: "utf-8",
    flag: "r",
  });

  const result = data.replace(
    /getStringAt\((0x[a-fA-F0-9]+)\)/gim,
    (i, match) => {
      return '"' + getStringAt(match) + '"';
    }
  );

  console.info("Stage 3 Complete: Replaced strings...");
  fs.writeFileSync("stages/stage3.js", result, {});
};

module.exports = stage0