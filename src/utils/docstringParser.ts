import {Docstring, DocstringNonArrayProperty} from "../models/docstring";

export function extractDescription(docstring: string): string {
    return docstring.split('\n')[0].trim();
}

export function docstringToHtml(docstring: string): string {
    const elements = parseDocstring(docstring);
    return generateHtmlContent(elements);
}

function separateToLines(keywords: string[], plainDocstring: string) {
    const separator = '???';
    const keywordHighlighter = new RegExp(keywords.map(x => '<br><br>' + x + '<br><br>').join('|'), 'g');

    plainDocstring = plainDocstring
        .replace(/"""/g, '')
        .replace(/::/g, ':')
        .replace(/\n{2,}/g, '<br><br>')
        .replace(/\n {3}/g, '<br><br>   ')
        .replace(/\n/g, ' ')
        .replace(/\.\. note:/g, '<strong>Note</strong>:')
        .replace(/\.\. /g, '   ')
        .replace(/\*\*/g, '')
        .replace(keywordHighlighter, (match) => `${separator}${match.split('<br><br>')[1]}${separator}`); // add a separator to the beginning of each keyword

    return plainDocstring.split(separator);
}

function parseDocstring(plainDocstring: string): Docstring {
    const keywords = ['Args:', 'Returns:', 'Raises:', 'Availability:', 'Example:', 'Output'];
    const lines = separateToLines(keywords, plainDocstring);
    let currentPosition = 0;
    const docstring: Docstring = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) {
            continue;
        }

        if (keywords.includes(line.split(' ')[0])) {
            const keyword = line.split(' ')[0].split(':')[0].toLowerCase() as DocstringNonArrayProperty;
            const {content, nextIndex} = parseElement(lines, ++i, (x: string) => !x.startsWith('   '));

            docstring[keyword] = {content, position: currentPosition};
            i = nextIndex - 1;
            currentPosition++;
            continue;
        }

        {
            const {content, nextIndex} = parseElement(lines, i, (x: string) => keywords.some(kw => x.startsWith(kw)));
            if (!docstring.descriptions) {
                docstring.descriptions = [];
            }
            docstring.descriptions.push({content, position: currentPosition});
            i = nextIndex - 1;
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
        let propName = Object.keys(docstring).find(key => docstring[key as DocstringNonArrayProperty]?.position === element.position);
        if (propName) {
            html += `<h3>${propName.charAt(0).toUpperCase() + propName.slice(1)}</h3>`;
        } else {
            propName = 'description';
            // check if it is a description[0]
            if (docstring.descriptions?.[0]?.position === element.position) {
                html += `<h3>Description</h3>`;
            }
        }
        html += `<div>${contentToHtml(element.content, propName)}</div>`;
    }

    return html;
}

function parseElement(lines: string[], i: number, condition: (line: string) => boolean): {
    content: string;
    nextIndex: number;
} {
    let content = '';

    for (i; i < lines.length; i++) {
        let line = lines[i];
        if (condition(line)) {
            break;
        }

        content += line;
    }

    return {
        content: content,
        nextIndex: i
    };
}

function contentToHtml(content: string, propName: string): string {
    content = content
        .replace(/``/g, '`')
        .replace(/`.*?`/g, '<code>$&</code>')
        .replace(/`/g, '')
        .replace(/ \(/g, '(')
        .replace(/\n/g, '<br>');

    if (propName.toLowerCase() === 'args') {
        if (!content.includes(':')) {
            return content;
        }
        content = inlineArgDescription(content);
        content = content
            .replace(/\b(\w+)\(/g, '<li><strong>$1</strong> (')
            .replace(/\(([^)]+)\)/g, '(<i>$1</i>)')
            .replace(/<br>/g, '</li>');
        content = `<ul>${content}</ul>`;
    }

    if (propName.toLowerCase() === 'example' || propName.toLowerCase() === 'output') {
        content = `<pre>${content}</pre>`;
    }

    return content;
}

function inlineArgDescription(content: string): string {
    const lines = content.split('<br>');
    const args: string[] = [];
    for (const line of lines) {
        if (line.includes(':')) {
            args.push(line);
        } else {
            args[args.length - 1] += ` ${line}`;
        }
    }

    return args.join('<br>');
}

