import { extractTestNameDetails, TestNameDetails } from "./testMonitoring";

export class CollectOnlyOutput {
    private readonly modules: CollectOnlyModule[] = [];

    constructor() {}

    addModule(module: CollectOnlyModule) {
        this.modules.push(module);
    }

    getLastModule() {
        return this.modules[this.modules.length - 1] || null;
    }

    getOutput(): TestNameDetails[] {
        const output: TestNameDetails[] = [];
        this.modules.forEach(m => {
            m.getFunctions().forEach(f => {
                let fullTestName = `${m.getName()}::${f.getName()}`;
                if (f.getParams()) {
                    fullTestName += `[${f.getParams()}]`;
                }

                output.push(extractTestNameDetails(fullTestName));
            });
        });
        return output;
    }
}

class CollectOnlyModule {
    private readonly functions: CollectOnlyFunction[] = [];

    constructor(private readonly name: string) {}

    addFunction(func: CollectOnlyFunction) {
        this.functions.push(func);
    }

    getFunctions() {
        return [...this.functions];
    }

    getName() {
        return this.name;
    }
}

class CollectOnlyFunction {
    private params?: string;

    constructor(private readonly name: string) {
        this.params = name.split('[')[1]?.split(']')[0];
    }

    public getName() {
        return this.name.split('[')[0];
    }

    public getParams() {
        return this.params;
    }
}

export function createCollectOnlyOutput(raw: string): CollectOnlyOutput {
    const output = new CollectOnlyOutput();
    const lines = raw.split('\n');
    lines.forEach(line => extractLine(line, output));
    return output;
}

function extractLine(line: string, output: CollectOnlyOutput): void {
    if (!line) {
        return;
    }
    
    const worker = Factory.createWorker(line, output);
    worker.work();
}

interface Worker {
    work(): void;
}

class ModuleWorker implements Worker {
    constructor(private readonly line: string, private readonly output: CollectOnlyOutput) {}

    public work() {
        const moduleName = this.line.split(' ')[1];
        this.output.addModule(new CollectOnlyModule(moduleName));
    }
}

class FunctionWorker implements Worker {
    constructor(private readonly line: string, private readonly output: CollectOnlyOutput) {}

    public work() {
        const functionName = this.line.split(' ')[1];
        this.output.getLastModule()?.addFunction(new CollectOnlyFunction(functionName));
    }
}

class DirWorker implements Worker {
    constructor(private readonly _: string, private readonly __: CollectOnlyOutput) {}

    public work() {}
}

class Factory {
    public static createWorker(line: string, output: CollectOnlyOutput): Worker {
        line = line.replaceAll('<', '').replaceAll('>', '');
        const elementType = line.split(' ')[0].toLowerCase();

        switch (elementType) {
            case 'module': return new ModuleWorker(line, output);
            case 'function': return new FunctionWorker(line, output);
            case 'dir': return new DirWorker(line, output);
            default: throw new Error('Unknown element type');
        }
    }
}
