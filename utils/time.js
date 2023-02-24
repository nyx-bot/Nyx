module.exports = (content) => {
     let returnObject = {
         timestamp: `--:--`,
         string: ``,
         units: {
             infinite: 0, 
             year: 0, 
             month: 0, 
             day: 0, 
             hour: 0, 
             minute: 0, 
             seconds: 0, 
             ms: 0
         }
     }
 
     if(typeof content == `string`) {
         if(content.includes(`:`)) {
             returnObject.units = utils.convertMS(utils.timestampStringToNum(content));
             returnObject.timestamp = utils.timestampConvert(returnObject.units);
             returnObject.string = utils.timeConvert(returnObject.units, false, 3);
             return returnObject;
         } else if(Number(content)) {
             returnObject.units = utils.convertMS(Number(content))
             returnObject.timestamp = utils.timestampConvert(returnObject.units);
             returnObject.string = utils.timeConvert(returnObject.units, false, 3);
             return returnObject;
         } else return returnObject;
     } else if(typeof content == `number`) {
         returnObject.units = utils.convertMS(content);
         returnObject.timestamp = utils.timestampConvert(returnObject.units);
         returnObject.string = utils.timeConvert(returnObject.units, false, 3);
         return returnObject;
     } else if(typeof content == `object`) {
         try {
             if(JSON.stringify(Object.keys(content).sort()) === JSON.stringify(Object.keys(returnObject.units).sort())) {
                 returnObject.units = content;
                 returnObject.timestamp = utils.timestampConvert(returnObject.units);
                 returnObject.string = utils.timeConvert(returnObject.units, false, 3);
                 return returnObject;
             } else return returnObject
         } catch(e) {return returnObject;}
     } else return returnObject;
 }