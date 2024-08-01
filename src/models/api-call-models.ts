export type PythonEntityType = "class" | "module";
export type PythonMemberType = "method" | "function";
export type PythonType = PythonEntityType | PythonMemberType;

export interface PythonArgument {
    name: string;
    default: any;
}

export interface PythonCallable {
    name: string;
    doc: string;
    args: PythonArgument[]
}

export interface PythonEntity {
    type: PythonEntityType;
    name: string;
    callables: PythonCallable[];
}
