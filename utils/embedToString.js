module.exports = (embed) => {
     let string = ``;
     Object.keys(embed).forEach(k => {
          if(typeof embed[k] == `string`) {
               while(embed[k].startsWith('> ')) {embed[k] = embed[k].replace('> ', '')};
               while(embed[k].includes('\n\n')) {embed[k] = embed[k].replace('\n\n', '\n')};
          }
     })
     if(embed.title) {
          if(embed.title.includes(`**`)) {string = `${embed.title}`} else {string = `**${embed.title}**`}
     };
     if(embed.description) {
          if(string) string = string + `\n${embed.description}`
          else string = `${embed.description}`
     }; if(string) {string = string + `\n> `}
     if(embed.fields && embed.fields.length !== 0) {
          embed.fields.forEach(field => {
               if(string) string = string + `\n**${field.name}**\n${field.value}`
               else string = `**${field.name}**\n${field.value}`
          })
     };
     if(embed.footer && embed.footer.text) {string = string + `\n\n${embed.footer.text}`};
     if(string.endsWith('> ')) {string = string.substring(0, string.length-3)};
     return string.replace('\n> \n> ', '\n> ');
}