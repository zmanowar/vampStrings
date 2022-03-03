export class StringsFunctionFinder {
  private functionNames: String[];
  originalName: String;
  getStringAt: Function;

  constructor(source, functionNames) {
    this.functionNames = functionNames;
    eval(source);
    this.findFunction();
  }

  private findFunction() {
    for (const funcName of this.functionNames) {
      if (eval(`${funcName}()`) instanceof Array) {
        console.info('Found main array of strings...');
      } else {
        this.originalName = funcName;
        this.getStringAt = eval(`${funcName}`);
      }
    }
  }
}
