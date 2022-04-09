const replacements = [
    [/\*/g, '\\*', 'asterisks'],
    [/#/g, '\\#', 'number signs'],
    [/\//g, '\\/', 'slashes'],
    [/\(/g, '\\(', 'parentheses'],
    [/\)/g, '\\)', 'parentheses'],
    [/\[/g, '\\[', 'square brackets'],
    [/\]/g, '\\]', 'square brackets'],
    [/</g, '&lt;', 'angle brackets'],
    [/>/g, '&gt;', 'angle brackets'],
    [/_/g, '\\_', 'underscores']
];

module.exports = function (string) {
    return replacements.reduce((string, replacement) => {
        return `${string}`.replace(replacement[0], replacement[1])
    }, string)
}