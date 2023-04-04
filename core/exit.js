const fs = require('fs');

const EventEmitter = require('events').EventEmitter;

let quitting = false;

module.exports = async (ctx, message) => {
     if(quitting) return console.log(`Exit called again, but already going through quit process!`);
     quitting = true;
     ctx.ignoreAllMessages = true;
     console.l(`┃ Exit called: ${message}`);
     setTimeout(() => {
          console.e(`┃ EXIT NOT COMPLETED WITHIN 35S; EXITING`);
          process.exit(1)
     }, 35000)
     ctx.bot.removeAllListeners();
     console.d(`┃ REMOVED ALL LISTENERS FROM THE DISCORD CLIENT.`)
     await ctx.bot.editStatus(`dnd`, [{name: `loading... / nyx.bot`, type: 3}]);
     console.d(`┃ SET DISCORD STATUS TO DND`)
     let queues = Object.entries(ctx.music).filter(o => !isNaN(o[0]))
     console.d(`┃ ${queues.length} MUSIC SESSIONS ARE ACTIVE`)
     if(queues.length > 0) {
          let e = new EventEmitter();
          let left = 0; toLeave = queues.length;
          e.on('updated', async () => {
               if(left == toLeave) return process.exit(0)
          })
          for(i in queues) {
               const id = queues[i][0]

               console.l(`┃ Pausing voice channel ${id}...`, ctx.music[id.queue]);

               try {
                    if(ctx.music[id].queue && ctx.music[id].queue.length > 0) {     
                         let obj = {
                              voiceChannel: ctx.music[id].channel.id,
                              guild: ctx.music[id].channel.guild.id,
                              queue: ctx.music[id].queue,
                              paused: ctx.music[id].paused
                         };
          
                         const msg = await ctx.music[id].end(`I need to pause the playback because I just got an update! I will resume your queue automatically when I'm ready again!`, null, true)
     
                         obj.message = msg.id;
                         obj.channel = msg.channel.id
                         
                         left++
          
                         console.d(`msgid: ${obj.message}`)
     
                         if(!fs.existsSync(`./etc/musicSessions/`)) {
                              fs.mkdirSync(`./etc/musicSessions`);
                              console.log(`created musicSessions dir!`)
                         };
     
                         console.d(obj)
     
                         fs.writeFileSync(`./etc/musicSessions/${obj.guild}.json`, JSON.stringify(obj, null, 4));
     
                         console.d(`successfuly wrote file!`);
                    } else {
                         console.l(`┃ Leaving voice channel ${id}...`, ctx.music[id.queue]);
     
                         if(ctx.music[id].end) await ctx.music[id].end(`I need to disconnect for a restart! The queue was empty, so I'm just going to leave the voice channel.\n\nYou can always start a new queue using the \`play\` command!`)
                    }
     
                    e.emit(`updated`);
                    await ctx.timeout(1000);
               } catch(e) {
                    console.error(`┃ Failed closing voice channel ${id} -- ${e}`)
                    e.emit(`updated`);
                    await ctx.timeout(1000);
               }
          }
     } else {
          return process.exit(0)
     }
}