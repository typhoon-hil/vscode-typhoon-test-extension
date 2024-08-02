export interface Docstring {
    descriptions?: DocstringElement[];
    args?: DocstringElement;
    returns?: DocstringElement;
    raises?: DocstringElement;
    availability?: DocstringElement;
    example?: DocstringElement;
    output?: DocstringElement;
}

interface DocstringElement {
    content: string;
    position: number;
}

export type DocstringNonArrayProperty = 'args' | 'returns' | 'raises' | 'availability' | 'example' | 'output';