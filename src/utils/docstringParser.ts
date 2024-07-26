interface Docstring {
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

type DosctringNonArrayProperty = 'args' | 'returns' | 'raises' | 'availability' | 'example' | 'output';

export function getDescription(docstring: string): string {
    return docstring.split('\n')[0].trim();
}