export type PythonEntityType = "class" | "module";
export type PythonCallableType = "callable";
export type PythonType = PythonEntityType | PythonCallableType;

export function isPythonEntityType(x: any): x is PythonEntityType {
    return x === "class" || x === "module";
}

export interface PythonArgument {
    name: string;
    default: any;
}

export interface PythonCallable {
    type: PythonCallableType;
    name: string;
    doc: string;
    args: PythonArgument[]
}

export interface PythonEntity {
    type: PythonEntityType;
    name: string;
    callables: PythonCallable[];
}

export interface PythonImport {
    type: PythonEntityType;
    name: string;
    alias: string;
}
