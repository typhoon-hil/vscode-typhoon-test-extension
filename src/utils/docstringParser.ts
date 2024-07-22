export function docstringToHtml(docstring: string): string {
    return `<div>${docstring.replace(/\n/g, '<br>')
        .replace(/(Args|Returns|Raises):/g, '<b>$1:</b>')
        .replace(/^( {4}|\t)(.*)/gm, '<code>$2</code>')}</div>`
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
    }

export function getDescription(docstring: string): string {
    return docstring.split('\n')[0].trim();
}