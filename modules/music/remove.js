module.exports = {
    "name": "remove",
    "desc": "Remove a specific song from the queue!",
    "args": [
        {
            "opt": false,
            "arg": "position of the track in the queue to remove, or the name of the track"
        }
    ],
    "permission": 3,
    "aliases": [
        "rm",
        "rem"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "track",
                "description": "The position or name of the track to remove",
                "required": true
            }
        ]
    },
    func: async function remove (ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue || ctx.music[msg.channel.guild.id].onHold.s === true || ctx.music[msg.channel.guild.id].queue.length === 0) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
        const searchInQueue = async (str) => {
            str = `${str}`
            let name = str.replace(/ /g, ``).toLowerCase().replace(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``);
            let results = ctx.music[msg.channel.guild.id].queue.slice(1).reverse().filter(s => s[0].toLowerCase().replace(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``).replace(/ /g, ``).includes(name));
            let perfectMatch = ctx.music[msg.channel.guild.id].queue.find(s => s[0] == str);
            let getIndexOf = (finalArr) => {
                console.d(`getting index of ${finalArr[0]}`)
                let i = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[7] === finalArr[7]);
                if(i < 0) i = ctx.music[msg.channel.guild.id].queue.findIndex(s => s[5] == finalArr[5] && s[6] == finalArr[6]);
                console.d(`the original string ${str} found a result of ${finalArr[0]} at index ${i} (which is ${ctx.music[msg.channel.guild.id].queue[i][0]})`)
                return i;
            }; 
            if(perfectMatch) return getIndexOf(perfectMatch)
            if(results.length > 1) {
                console.d(`FIRST BATCH OF RESULTS IN MV COMMAND`, results.map(s => s[0]))
                name = str.toLowerCase().replace(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``);
                let results2 = ctx.music[msg.channel.guild.id].queue.slice(1).reverse().filter(s => ctx.music[msg.channel.guild.id].queue.find(b => b[7] == s[7]) && s[0].toLowerCase().replace(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``).includes(name));
                if(results2.length > 1) {
                    console.d(`SECOND BATCH OF RESULTS IN MV COMMAND`, results2.map(s => s[0]))
                    name = str.replace(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``);
                    let results3 = ctx.music[msg.channel.guild.id].queue.slice(1).reverse().filter(s => ctx.music[msg.channel.guild.id].queue.find(b => b[7] == s[7]) && s[0].replace(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``).includes(name));
                    if(results3.length > 1 || results3.length === 1) {
                        console.d(`THIRD BATCH OF RESULTS IN MV COMMAND`, results3.map(s => s[0]))
                        const query = results3.find(s => s[0].length <= str.replace(/ /g, ``).toLowerCase().replace(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``).length) || results3[0]
                        console.d(`found match to name ${str} with ${query[0]}`); 
                        return getIndexOf(query);
                    } else if(results2.find((s => s[0].length <= str.toLowerCase().replace(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``).length))) {
                        const query = results2.find((s => s[0].length <= str.toLowerCase().replace(/[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``).length)) || results2[0]
                        console.d(`found match to name ${str} with ${query[0]}`); 
                        return getIndexOf(query);
                    } else {console.d(`just returning an index search to results2`); return getIndexOf(results2[0])}
                } else if(results2.length === 1) {
                    return getIndexOf(results2[0]);
                } else if(results.find(s => s[0].length <= str.replace(/ /g, ``).toLowerCase().replace(/[\d\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``).length)) {
                    const query = results.find(s => s[0].length <= str.replace(/ /g, ``).toLowerCase().replace(/[\d\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\>\=\?\@\[\]\{\}\\\\\^\_\`\~]+/, ``).length)
                    {console.d(`found match to name ${str} with ${query[0]}`); return getIndexOf(query)};
                } else {console.d(`just returning an index search to results`); return getIndexOf(results[0])}
            } else if(results.length === 1) {
                console.d(`returning an index search to results, only match!`); return getIndexOf(results[0])
            } else null;
        }; if(args[0] && isNaN(args.join(``)) && args.length !== 1) {
            const n = args.pop();
            const q = await searchInQueue(args.join(' '));
            args[0] = q || args[0];
            args[1] = n;
        }; console.d(`${args[0]} is 0th arg in rm`)
    
        if(isNaN(args[0])) {return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``)} else {
            let num = Math.round(args[0])
            if(num > ctx.music[msg.channel.guild.id].queue.length || num < 1) {return msg.reply(`${ctx.fail} You can only remove tracks between **1 - ${ctx.music[msg.channel.guild.id].queue.length}**!`)} else {
                let song = ctx.music[msg.channel.guild.id].queue.splice(num, 1)
                msg.reply(`${ctx.pass} Successfully removed **${ctx.utils.escapeDiscordsFuckingEditing(song[0][0] || song[0])}**`);
                ctx.music[msg.channel.guild.id].fetchNextTracks()
                if(ctx.streamCache[song[7]]) {delete ctx.streamCache[song[7]]};
                /* if(num === 1 && ctx.music[msg.channel.guild.id].queue[1] && !ctx.streamCache[ctx.music[msg.channel.guild.id].queue[1][7]]) {
                    ctx.utils.music.getStream(ctx, ctx.music[msg.channel.guild.id].queue[1], false, true).catch(e => {console.l(`${e}`)})
                } */
            }
        }
    }
}