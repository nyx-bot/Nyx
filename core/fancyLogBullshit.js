module.exports = () => {
     console.l(`┏${`━`.repeat(45)}┓`)
     core.boxLog(`┃   .@@@             #@@@  \n┃  /@@@@@@         /@@@@@@.\n┃ @@@@@@@@@@##(. (@@@@@@@@@\n┃  @@@@@@@@@&@@@@@@@@@@@@@@\n┃   @@@@@@@@@@@@@@@@@@@@@* \n┃    /@@@@@@@@@@@@@@@@@@   \n┃    /@@@@@@@@@@@@@@@@@@   \n┃     @@@@@@@@@@@@@@@@@%   \n┃       *@@@@@@@@@@@%#`);
     const pkg = require('../package.json');
     core.boxLog(`┃   \n┃   NyxBot [v${pkg.version}]\n┃   Authored By:\n┃   | ${pkg.author.split('; ').join('\n┃   | ')}\n┃   `)
}