export type PythonEntityType = "class" | "module";
export type PythonMemberType = "method" | "function";
export type PythonType = PythonEntityType | PythonMemberType;

export interface FunctionArgument {
    name: string;
    default: any;
}