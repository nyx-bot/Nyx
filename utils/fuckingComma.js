module.exports = (string) => {
     if(typeof string == `number`) {string = string.toLocaleString('fullwide', {useGrouping:false})}; string = `${string}`
     const a = string.split('').reverse(), b = a.slice(0);
     let c = 0, done = 1;
     const d = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50]
     while(c !== b.length) {
          if(d.find(n => n == c)) {a.splice(c+done, 0, `,`); done++;}
          c++;
     };
     let e = a.reverse().join(''); if(e.startsWith(`,`)) {e = e.replace(',', '')}
     return e
}