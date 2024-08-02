import {PythonArgument, PythonImport} from "./pythonEntity";

export interface CodeSnippet {
    import: string;
    class?: string;
    method: string;
}

export interface RenderArgumentsMessage {
    root: PythonImport;
    name: string;
    args: PythonArgument[];

}

export interface TakenActionMessage {
    command: string;
    code?: CodeSnippet;
    log?: string;
}