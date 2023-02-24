module.exports = () => {
     let chance = [true, true, false, false, false, false, false, false]
     let string = ``
     if(chance[Math.floor(Math.random() * chance.length)] === true) {
          string = `\n\nHey!`
     };
     return string
}