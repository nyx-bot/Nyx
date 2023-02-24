module.exports = function (obj) {
     if(typeof obj == "number" || typeof obj == "string") {
          let num = Number(Math.round(Number(obj) / 1000)) * 1000;
          obj = utils.convertMS(num);
     } else if(typeof obj == `object` && obj.length !== undefined) {
          let num = Number(Math.round(Number(obj[0]) / 1000)) * 1000;
          obj = utils.convertMS(num);
     }
     let string = null;
     if(obj.infinite) {
          string = `--:--`
     } else {
          let array = [];
          if(obj.year < 10) {
               obj.year = `0${obj.year}`;
          }
          if(obj.year === 0) {
               obj.year = `00`;
          }
          array.push(`${obj.year}`);
          if(obj.month < 10) {
               obj.month = `0${obj.month}`;
          }
          if(obj.month === 0) {
               obj.month = `00`;
          }
          array.push(`${obj.month}`);
          if(obj.day < 10) {
               obj.day = `0${obj.day}`;
          }
          if(obj.day === 0) {
               obj.day = `00`;
          }
          array.push(`${obj.day}`);
          if(obj.hour < 10) {
               obj.hour = `0${obj.hour}`;
          }
          if(obj.hour === 0) {
               obj.hour = `00`;
          }
          array.push(`${obj.hour}`);
          if(obj.minute < 10) {
               obj.minute = `0${obj.minute}`;
          }
          if(obj.minute === 0) {
               obj.minute = `00`;
          }
          array.push(`${obj.minute}`);
          if(obj.seconds < 10) {
               obj.seconds = `0${obj.seconds}`;
          }
          if(obj.seconds === 0) {
               obj.seconds = `00`;
          }
          array.push(`${obj.seconds}`);
          let startAt = null;
          let checked = 0;
          array.forEach((num) => {
               if(startAt === null) {
                    if(!(num == "00") && Number(num) > 0) {
                         startAt = checked;
                    }
               }
               checked = checked + 1;
          });
          if(startAt === null) {
               return "--:--";
          }
          let numGoing = startAt;
          while (!(numGoing == array.length)) {
               if(!string) {
                    string = `${array[numGoing]}`;
               } else {
                    string = `${string}:${array[numGoing]}`;
               }
               numGoing = numGoing + 1;
          }
          if(!string) {
               return `--:--`;
          }
          if(string.length === 2) {
               string = `00:${string}`;
          }
     }

     return string;
}