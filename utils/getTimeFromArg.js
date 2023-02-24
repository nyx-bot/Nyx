module.exports = function(args) {
     return new Promise((res, rej) => {
          let timetowaste = 0;
          function run() {
               if(args[0]) {
                    dhdh = (args[0].replace(/\d+/, '')).toLowerCase();
                    if(dhdh == 'd' || dhdh == 'm' || dhdh == 'mo' || dhdh == 'h' || dhdh == 'hrs' || dhdh == 'hr' || dhdh == 'w' || dhdh == 'wk' || dhdh == 'wks' || dhdh == 's' || dhdh == 'mins' || dhdh == 'min' || dhdh == 'y' || dhdh == 'yr') {
                         args[0] == args[0].toLowerCase(); args[0].replace(dhdh, ''); args[0] = Math.round(args[0].match(/\d+/))
                         if(dhdh == 's') {timetowaste = timetowaste+(Number(args[0])*1000)}
                         if(dhdh == 'm' || dhdh == 'min' || dhdh == 'mins') {timetowaste = timetowaste+(Number(args[0])*60000)}
                         if(dhdh == 'h' || dhdh == 'hr' || dhdh == 'hrs') {timetowaste = timetowaste+(Number(args[0])*3600000)}
                         if(dhdh == 'd') {timetowaste = timetowaste+(Number(args[0])*86400000)}
                         if(dhdh == 'w' || dhdh == 'wk' || dhdh == 'wks') {timetowaste = timetowaste+(Number(args[0])*604800000)}
                         if(dhdh == 'mo') {timetowaste = timetowaste+(Number(args[0])*2592000000)}
                         if(dhdh == 'y' || dhdh == 'yr') {timetowaste = timetowaste+(Number(args[0])*31536000000)}
                         args.shift()
                         run()
                    } else {
                         return res({
                              time: timetowaste,
                              args,
                         })
                    }
               } else return res({
                    time: timetowaste,
                    args,
               })
          }
          run();
     })
}