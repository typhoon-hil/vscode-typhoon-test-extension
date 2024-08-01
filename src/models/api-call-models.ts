export type PythonEntityType = "class" | "module";
export type PythonMemberType = "method" | "function";
export type PythonType = PythonEntityType | PythonMemberType;

export interface PythonArgument {
    name: string;
    default: any;
}