module.exports = function(ms) {
     if(typeof ms != `number` && isNaN(ms)) return console.l(`ms in convertms is not a number!`);
     if(typeof ms == `string`) {ms = Number(ms)}
     var obj = {infinite: 0, year: 0, month: 0, day: 0, hour: 0, minute: 0, seconds: 0, ms};
     if(ms >= 2.3652e+14) {
          obj.infinite = 1
     } else {
          while(ms >= 31540000000000) {obj.year = obj.year + 1000; ms = ms-31540000000000}
          while(ms >= 15770000000000) {obj.year = obj.year + 500; ms = ms-15770000000000}
          while(ms >= 3154000000000) {obj.year = obj.year + 100; ms = ms-3154000000000}
          while(ms >= 1577000000000) {obj.year = obj.year + 50; ms = ms-1577000000000}
          while(ms >= 157700000000) {obj.year = obj.year + 5; ms = ms-157700000000}
          while(ms >= 31536000000) {obj.year++; ms = ms-31536000000}
          while(ms >= 2592000000) {obj.month++; ms = ms-2592000000}
          while(ms >= 86400000) {obj.day++; ms = ms-86400000}
          while(ms >= 3600000) {obj.hour++; ms = ms-3600000}
          while(ms >= 60000) {obj.minute++; ms = ms-60000}
          while(ms >= 1000) {obj.seconds++; ms = ms-1000}
     }
     return obj;
}