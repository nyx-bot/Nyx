module.exports = function (ts) {
     if(!`${ts}`.includes(`:`)) return 0;
     const tsArr = ts.split(':').reverse();
     let finalNum = 0;//sec,  min,   hour,    day,      month,      year,        5 years,      50 years,      100 years,     500 years,      1000 years
     let conversions = [1000, 60000, 3600000, 86400000, 2592000000, 31536000000, 157700000000, 1577000000000, 3154000000000, 15770000000000, 31540000000000]
     for(i in tsArr) {
          finalNum = finalNum + Number(tsArr[Number(i)]) * (conversions[Number(i)])
     };
     return (finalNum)
}