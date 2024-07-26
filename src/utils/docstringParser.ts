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

function parseDocstring(plainDocstring: string): Docstring {
    const keywords = ['Args:', 'Returns:', 'Raises:', 'Availability:', 'Example:', 'Output'];
    plainDocstring = plainDocstring
        .replace(/"""/g, '')
        .replace(/::/g, ':')
        .replace(/\n+/g, '\n')
        .replace(/\.\. note:/g, 'Note:')
        .replace(/\.\. /g, '    ')
        .replace(/\*\*/g, '');
    const lines = plainDocstring.split('\n');
    let currentPosition = 0;
    const docstring: Docstring = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) {
            continue;
        }

        if (keywords.includes(line.split(' ')[0])) {
            const keyword = line.split(' ')[0].split(':')[0].toLowerCase() as DosctringNonArrayProperty;
            const { content, nextIndex } = parseElement(lines, ++i, (x:string) => !x.startsWith('   ')); 

            docstring[keyword] = {content, position: currentPosition};
            i = nextIndex-1;
            currentPosition++;
            continue;
        }

        {
            const { content, nextIndex } = parseElement(lines, i, (x: string) => keywords.some(kw => x.startsWith(kw)));
            if (!docstring.descriptions) {
                docstring.descriptions = [];
            }
            docstring.descriptions.push({content, position: currentPosition});
            i = nextIndex-1;
            currentPosition++;
        }
    }

    return docstring;
}

function generateHtmlContent(docstring: Docstring): string {
    let html = '';

    const flatElements = Object.values(docstring).flat();
    flatElements.sort((a, b) => a.position - b.position);

    for (const element of flatElements) {
        const propName = Object.keys(docstring).find(key => docstring[key as DosctringNonArrayProperty]?.position === element.position);
        if (propName) {            
            html += `<h3>${propName.charAt(0).toUpperCase() + propName.slice(1)}</h3>`;
        }
        else {
            // check if it is a description[0]
            if (docstring.descriptions?.[0]?.position === element.position) {
                html += `<h3>Description</h3>`;
            }
        }
        html += `<div>${element.content}</div>`;
    }

    return html;
}

export function docstringToHtml(docstring: string): string {
    const elements = parseDocstring(docstring);
    const html = generateHtmlContent(elements);
    return html;
}

function parseElement(lines: string[], i: number, condition: (line: string) => boolean): { content: string; nextIndex: number; } {
    let content = '';
    
    for (i; i < lines.length; i++) {
        let line = lines[i];
        if (condition(line)) {
            return {
                content: content,
                nextIndex: i
            };
        }

        content += '\n' + line;
    }

    return {
        content: content,
        nextIndex: i
    };
}
