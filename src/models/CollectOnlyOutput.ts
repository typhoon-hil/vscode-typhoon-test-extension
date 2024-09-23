import { extractTestNameDetails, TestNameDetails } from "./testMonitoring";

export class CollectOnlyOutput {
    private readonly root: CollectOnlyDir = new CollectOnlyDir('');
    private package: CollectOnlyDir | undefined;
    private lastModule: CollectOnlyModule | undefined;
    
    constructor() { }
    
    addDir(dir: CollectOnlyDir) {
        this.root.addDir(dir);
        this.lastModule = dir.getModules()[dir.getModules().length - 1] || this.lastModule;
    }
    
    set LastModule(module: CollectOnlyModule) {
        this.lastModule = module;
    }

    get LastModule(): CollectOnlyModule | undefined {
        return this.lastModule;
    }
    
    changePackage(dir: CollectOnlyDir) {
        this.package = dir;
    }

    getOutput(): TestNameDetails[] {
        const output: TestNameDetails[] = [];
        
        const processModule = (module: any, prefix: string = '') => {
            module.getFunctions().forEach((f: any) => {
                let fullTestName = `${prefix}${module.getName()}::${f.getName()}`;
                if (f.getParams()) {
                    fullTestName += `[${f.getParams()}]`;
                }
                output.push(extractTestNameDetails(fullTestName));
            });
        };

        const processDir = (dir: CollectOnlyDir, prefix: string = '') => {
            dir.getModules().forEach(m => processModule(m, `${prefix}${dir.getName()}/`));
            dir.getDirs().forEach(d => processDir(d, `${prefix}${dir.getName()}/`));
        };

        this.root.getModules().forEach(m => processModule(m));
        this.root.getDirs().forEach(d => processDir(d));

        return output;
    }

    addDirsWithModule(path: string) {
        const paths = path.split('/');
        let currentDir = this.package || this.root;
        paths.forEach((p) => {
            if (p.endsWith('.py')) {
                const module = new CollectOnlyModule(p);
                currentDir.addModule(module);
                this.LastModule = module;
                return;
            }
            const dir = currentDir.findDir(p);
            if (dir) {
                currentDir = dir;
            } else {
                const newDir = new CollectOnlyDir(p);
                currentDir.addDir(newDir);
                currentDir = newDir;
            }
        });
    }
}

class CollectOnlyModule {
    private readonly functions: CollectOnlyFunction[] = [];

    constructor(private readonly name: string) { }

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

class CollectOnlyDir {
    private readonly modules: CollectOnlyModule[] = [];
    private readonly dirs: CollectOnlyDir[] = [];

    constructor(private readonly name: string) { }

    getName() {
        return this.name;
    }

    addModule(module: CollectOnlyModule) {
        this.modules.push(module);
    }

    addDir(dir: CollectOnlyDir) {
        this.dirs.push(dir);
    }

    getModules() {
        return [...this.modules];
    }

    getDirs() {
        return [...this.dirs];
    }

    findModule(moduleName: string): CollectOnlyModule | undefined {
        return this.modules.find(module => module.getName() === moduleName);
    }

    findDir(dirName: string): CollectOnlyDir | undefined {
        return this.dirs.find(dir => dir.getName() === dirName);
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
    constructor(private readonly line: string, private readonly output: CollectOnlyOutput) { }

    public work() {
        const moduleName = this.line.split(' ')[1];
        this.output.addDirsWithModule(moduleName);
    }
}

class FunctionWorker implements Worker {
    constructor(private readonly line: string, private readonly output: CollectOnlyOutput) { }

    public work() {
        const functionName = this.line.split(' ')[1];
        this.output.LastModule?.addFunction(new CollectOnlyFunction(functionName));
    }
}

class PackageWorker implements Worker {
    constructor(private readonly line: string, private readonly output: CollectOnlyOutput) { }

    public work() {
        const packageName = this.line.split(' ')[1];
        const dir = new CollectOnlyDir(packageName);
        this.output.addDir(dir);
        this.output.changePackage(dir);
    }
}

class DirWorker implements Worker {
    constructor(private readonly _: string, private readonly __: CollectOnlyOutput) { }

    public work() { }
}

class Factory {
    public static createWorker(line: string, output: CollectOnlyOutput): Worker {
        line = line.replaceAll('<', '').replaceAll('>', '');
        const elementType = line.split(' ')[0].toLowerCase();

        switch (elementType) {
            case 'package': return new PackageWorker(line, output);
            case 'module': return new ModuleWorker(line, output);
            case 'function': return new FunctionWorker(line, output);
            case 'dir': return new DirWorker(line, output);
            default: throw new Error('Unknown element type');
        }
    }
}
