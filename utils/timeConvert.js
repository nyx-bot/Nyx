module.exports = function (obj, setting, givenLimit) {
     return new Promise((res, rej) => {
          let limit = undefined;
          if(!isNaN(givenLimit)) {
               limit = Math.round(givenLimit);
          }
          if(typeof obj == "number" || typeof obj == "string") {
               let num = Number(Math.round(Number(obj) / 1000)) * 1000;
               obj = utils.convertMS(num);
          };
          if(obj.infinite) {
               return res(`∞`)
          } else {
               if(limit === undefined) {limit = Object.entries(obj).length-1}
               let p = {
                    year: " years",
                    month: " months",
                    day: " days",
                    hour: " hours",
                    minute: " minutes",
                    second: " seconds",
                    yearone: " year",
                    monthone: " month",
                    dayone: " day",
                    hourone: " hour",
                    minuteone: " minute",
                    secondone: " second",
               };
               if(setting) {
                    p = {
                         year: "y",
                         month: "mo",
                         day: "d",
                         hour: "h",
                         minute: "m",
                         second: "s",
                         yearone: "y",
                         monthone: "mo",
                         dayone: "d",
                         hourone: "h",
                         minuteone: "m",
                         secondone: "s",
                    };
               }
               let timeff = obj;
               let count = 0;
               let time = "";
               if(limit === 0) {
                    return res(time);
               }
               if(timeff.ms < 1000) {
                    time = `0${p.second}`;
                    return res(time)
               } else {
                    if(!(timeff.year === 0)) {
                         if(limit === 1) {
                              if(timeff.year === 1) {
                                   time = `${time} and ${timeff.year}${p.yearone}`;
                              } else {
                                   time = `${time} and ${timeff.year}${p.year}`;
                              }
                         } else {
                              if(count === 0) {
                                   if(timeff.year === 1) {
                                        time = `${timeff.year}${p.yearone}`;
                                   } else {
                                        time = `${timeff.year}${p.year}`;
                                   }
                              } else {
                                   if(timeff.year === 1) {
                                        time = `${time}, ${timeff.year}${p.yearone}`;
                                   } else {
                                        time = `${time}, ${timeff.year}${p.year}`;
                                   }
                              }
                         }
                         limit--; count++
                    }; if(limit === 0) return res(time);
                    if(!(timeff.month === 0)) {
                         if(limit === 1) {
                              if(timeff.month === 1) {
                                   time = `${time} and ${timeff.month}${p.monthone}`;
                              } else {
                                   time = `${time} and ${timeff.month}${p.month}`;
                              }
                         } else {
                              if(count === 0) {
                                   if(timeff.month === 1) {
                                        time = `${timeff.month}${p.monthone}`;
                                   } else {
                                        time = `${timeff.month}${p.month}`;
                                   }
                              } else {
                                   if(timeff.month === 1) {
                                        time = `${time}, ${timeff.month}${p.monthone}`;
                                   } else {
                                        time = `${time}, ${timeff.month}${p.month}`;
                                   }
                              }
                         }
                         limit--; count++
                    }; if(limit === 0) return res(time);
                    if(!(timeff.day === 0)) {
                         if(limit === 1) {
                              if(timeff.day === 1) {
                                   time = `${time} and ${timeff.day}${p.dayone}`;
                              } else {
                                   time = `${time} and ${timeff.day}${p.day}`;
                              }
                         } else {
                              if(count === 0) {
                                   if(timeff.day === 1) {
                                        time = `${timeff.day}${p.dayone}`;
                                   } else {
                                        time = `${timeff.day}${p.day}`;
                                   }
                              } else {
                                   if(timeff.day === 1) {
                                        time = `${time}, ${timeff.day}${p.dayone}`;
                                   } else {
                                        time = `${time}, ${timeff.day}${p.day}`;
                                   }
                              }
                         }
                         limit--; count++
                    }; if(limit === 0) return res(time);
                    if(!(timeff.hour === 0)) {
                         if(limit === 1) {
                              if(timeff.hour === 1) {
                                   time = `${time} and ${timeff.hour}${p.hourone}`;
                              } else {
                                   time = `${time} and ${timeff.hour}${p.hour}`;
                              }
                         } else {
                              if(count === 0) {
                                   if(timeff.hour === 1) {
                                        time = `${timeff.hour}${p.hourone}`;
                                   } else {
                                        time = `${timeff.hour}${p.hour}`;
                                   }
                              } else {
                                   if(timeff.hour === 1) {
                                        time = `${time}, ${timeff.hour}${p.hourone}`;
                                   } else {
                                        time = `${time}, ${timeff.hour}${p.hour}`;
                                   }
                              }
                         }
                         limit--; count++
                    }; if(limit === 0) return res(time);
                    if(!(timeff.minute === 0)) {
                         if(limit === 1) {
                              if(timeff.minute === 1) {
                                   time = `${time} and ${timeff.minute}${p.minuteone}`;
                              } else {
                                   time = `${time} and ${timeff.minute}${p.minute}`;
                              }
                         } else {
                              if(count === 0) {
                                   if(timeff.minute === 1) {
                                        time = `${timeff.minute}${p.minuteone}`;
                                   } else {
                                        time = `${timeff.minute}${p.minute}`;
                                   }
                              } else {
                                   if(timeff.minute === 1) {
                                        time = `${time}, ${timeff.minute}${p.minuteone}`;
                                   } else {
                                        time = `${time}, ${timeff.minute}${p.minute}`;
                                   }
                              }
                         }
                         limit--; count++
                    }; if(limit === 0) return res(time);
                    if(!(timeff.seconds === 0)) {
                         if(limit === 1) {
                              if(timeff.seconds === 1) {
                                   time = `${time} and ${timeff.seconds}${p.secondone}`;
                              } else {
                                   time = `${time} and ${timeff.seconds}${p.second}`;
                              }
                         } else {
                              if(count === 0) {
                                   if(timeff.seconds === 1) {
                                        time = `${timeff.seconds}${p.secondone}`;
                                   } else {
                                        time = `${timeff.seconds}${p.second}`;
                                   }
                              } else {
                                   if(timeff.seconds === 1) {
                                        time = `${time}, ${timeff.seconds}${p.secondone}`;
                                   } else {
                                        time = `${time}, ${timeff.seconds}${p.second}`;
                                   }
                              }
                         }
                         limit--; count++
                    }; return res(time);
               }
          }
     })
}