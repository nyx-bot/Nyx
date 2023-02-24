module.exports = (string) => {
     const lineLength = 48;
     string = string.split('\n');
     for(i in string) {
          while(string[i].length+4 <= lineLength) {string[i] = `${string[i]} `};
          if(!string[i].endsWith(` ┃`) && !string[i].endsWith(`┏`)) {string[i] = `${string[i]} ┃`}
          if(!string[i].startsWith(`┃ `) && !string[i].startsWith(`┓`)) {string[i] = `┃ ${string[i]}`}
     }
     console.l(string.join('\n'))
}