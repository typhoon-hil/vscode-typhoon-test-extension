import { extractTestNameDetails, TestNameDetails } from "./testMonitoring";


export class CollectOnlyOutput {
    private readonly root: CollectOnlyRoot = new CollectOnlyRoot();
    private levels: { [level: number]: CollectOnlyComponent } = {};
    private currentIndent: number;

    constructor(initialIndent: number) {
        this.levels[initialIndent / 2 - 1] = this.root;
        this.currentIndent = initialIndent / 2 - 1;
    }

    private dropLevels() {
        for (let level in this.levels) {
            if (parseInt(level) > this.currentIndent) {
                delete this.levels[level];
            }
        }
    }

    addComponent(line: string) {
        const indent = getIndentLevel(line);
        const worker = Factory.createComponent(line);
        this.levels[indent] = worker;
        this.CurrentIndent = indent;
        this.Parent.add(worker);
    }

    private set CurrentIndent(indent: number) {
        this.currentIndent = indent;
        this.dropLevels();
    }

    private get Parent(): CollectOnlyComponent {
        const parentIndent = this.currentIndent - 1;
        return this.levels[parentIndent] || this.root;
    }

    getOutput(): TestNameDetails[] {
        return this.root.getNames().map(name => extractTestNameDetails(name));
    }
}

function getIndentLevel(line: string): number {
    for (let i = 0; i < line.length; i++) {
        if (line[i] !== ' ') {
            return i / 2;
        }
    }
    return 0;
}

class CollectOnlyComponent {
    protected children: CollectOnlyComponent[] = [];

    constructor(protected readonly name: string) {
    }

    add(component: CollectOnlyComponent): void {
        this.children.push(component);
    }

    getChildren(): CollectOnlyComponent[] {
        return [...this.children];
    }

    getNames(): string[] {
        return [];
    }

    getName(): string {
        return this.name;
    }

    findChild(name: string): CollectOnlyComponent | undefined {
        return this.children.find(child => child.getName() === name);
    }
}

class CollectOnlyFolder extends CollectOnlyComponent {
    constructor(name: string) {
        super(name);
    }

    getNames(): string[] {
        return this.children.flatMap(child => child.getNames())
            .map(childName => `${this.name}/${childName}`);
    }
}

class CollectOnlyModule extends CollectOnlyComponent {
    constructor(name: string) {
        super(name);
    }

    getNames(): string[] {
        return this.children.flatMap(child => child.getNames())
            .map(childName => `${this.name}::${childName}`);
    }
}

class CollectOnlyClass extends CollectOnlyModule {
}

class CollectOnlyFunction extends CollectOnlyComponent {
    constructor(name: string) {
        super(name);
    }

    getNames(): string[] {
        return [this.name];
    }
}

class CollectOnlyRoot extends CollectOnlyComponent {
    constructor() {
        super('');
    }

    getNames(): string[] {
        return this.children.flatMap(child => child.getNames());
    }
}

class Factory {
    public static createComponent(line: string): CollectOnlyComponent {
        line = line.replaceAll('<', '').replaceAll('>', '').trim();
        const elementType = line.split(' ')[0].toLowerCase();
        const nameWithPath = line.split(' ')[1];
        const paths = nameWithPath.split('/');
        const name = paths.pop() || '';
        const root = new CollectOnlyRoot();

        let parent = root;
        paths.forEach(path => {
            const element = parent.findChild(path);
            if (element) {
                parent = element;
            } else {
                const folder = new CollectOnlyFolder(path);
                parent.add(folder);
                parent = folder;
            }
        });

        root.add(this._createComponent(elementType, name));
        return root.getChildren()[0];
    }

    private static _createComponent(elementType: string, name: string): CollectOnlyComponent {
        switch (elementType) {
            case 'package': return new CollectOnlyFolder(name);
            case 'module': return new CollectOnlyModule(name);
            case 'function': return new CollectOnlyFunction(name);
            case 'class': return new CollectOnlyClass(name);
            default: throw new Error('Unknown element type');
        }
    }
}

export function createCollectOnlyOutput(raw: string): CollectOnlyOutput {
    const lines = raw.split('\n').filter(line => line);
    const indent = getIndentLevel(lines[0] || '');

    const output = new CollectOnlyOutput(indent);
    lines.forEach(line => output.addComponent(line));
    return output;
}
