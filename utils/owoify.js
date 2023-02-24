module.exports = (string) => {
     startoff = false;
     done = -1;
     let args;
     if(typeof string == `object`) {args = string} else {args = string.split(' ')};
     let assSwitch = false;
     function replaceOwO(string) {
          done++
          if(string.startsWith(`<`) && !string.endsWith(`>`)) {
               assSwitch = true;
               return string;
          } else if(string.startsWith(`\``) && !string.endsWith(`\``)) {
               assSwitch = true;
               return string;
          } else if(string.startsWith(`:`) && !string.endsWith(`:`)) {
               assSwitch = true;
               return string;
          } else if(assSwitch) {
               if(string.endsWith(`>`) || string.endsWith(`\``) || string.endsWith(`:`)) {
                    assSwitch = false;
                    return string;
               } else return string;
          } else if((string.startsWith('<') && string.endsWith('>')) || (string.startsWith(`:`) && string.endsWith(`:`)) || (string.startsWith(`\``) && string.endsWith(`\``)) || (string.includes(`](https://`) && string.includes(`)`)) || (string.includes(`](http://`) && string.includes(`)`))) {
               return string;
          } else {
               if(string == 'hello' || string == 'hey' || string == 'hi') {if(startoff === false && (done === 1 || done === 0)) {startoff = true; return "hhewwo"}}
               if(string == 'hello?' || string == 'hey?' || string == 'hi?') {if(startoff === false && (done === 1 || done === 0)) {startoff = true; return "hhewwo?"}}
               return string
                    .replace(/dick|penis|cock|balls/g, "bulge")
                    .replace(/heck/g, "hecc")
                    .replace(/what/g, "wat")
                    .replace(/(?:r|l)/g, "w")
                    .replace(/(?:R|L)/g, "W")
                    .replace(/n([aeiou])/g, 'ny$1')
                    .replace(/N([aeiou])/g, 'Ny$1')
                    .replace(/N([AEIOU])/g, 'Ny$1')
                    .replace(/ove/g, "ov")
                    .replace(/ou/g, "uw")
          }
     }; let newArray = [];
     args.forEach(a => newArray.push(replaceOwO(a.toLowerCase())))
     return newArray.join(' ');
}