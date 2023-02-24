let justJoined = {};

const voice = async (member, newc, oldc, ctx, type) => {
    if(!member.guild || !member.id || !member.guild.id) return; // this has happened too many times and fucked nyx
    if(member.id && member.guild) console.debugLog(member.id + ` switched, joined, or left a channel! this is a${ctx.music[member.guild.id] ? ` VALID` : `n INVALID`} statement; ${ctx.music[member.guild.id] ? `there is a session of music playing in the guild of that member` : `there is no music session from the guild of that member.`}`)
    if(ctx.music[member.guild.id]) {
        if(ctx.music[member.guild.id].finalEndCalled) return;
        async function run() {
            await ctx.timeout(180)
            console.debugLog(member.id + ` switched, joined, or left a channel!`)
            if(member.user.id == ctx.bot.user.id && ctx.music[member.guild.id]) {
                if(type != `leave`) {
                    console.debugLog(`it was nyx`)
                    ctx.music[member.guild.id].channel = newc;
                    justJoined[member.guild.id] = Date.now();
                    setTimeout(() => {delete justJoined[member.guild.id]}, 5000)
                } else if(type == `leave` && !ctx.music[member.guild.id].botDisconnected) {
                    console.debugLog(`nyx was disconnected :(,, lets just clear that queue..`)
                    ctx.music[member.guild.id].botDisconnected = true;
                    ctx.music[member.guild.id].end(1)
                } else {
                    const time = await ctx.utils.timeConvert(ctx.music[member.guild.id].noMemberLeaveTimeout || 60000)
                    //const num = ctx.music[member.guild.id].channel.voiceMembers.filter(m => m.id !== ctx.bot.user.id).length;
                    const num = 1
                    //const deafenedMembers = ctx.music[member.guild.id].channel.voiceMembers.filter(m => m.id !== ctx.bot.user.id && m.voiceState.selfDeaf === true).length
                    const deafenedMembers = 0
                    console.debugLog(num, deafenedMembers)
                    if(num === 0 && !ctx.music[member.guild.id].noMemberTimer && !ctx.music[member.guild.id].autoPause) {
                        console.debugLog(`there are no more members in the active channel... started a timer to disconnect`)
                        ctx.music[member.guild.id].lastChannel.createMessage(`<:NyxConfusion:942164350788042772> I was left alone here! I'll go ahead and pause the queue for now... I'll still be here for another ${time} if you still want to keep listening!`)
                        if(justJoined[member.guild.id]) await ctx.timeout(1500)
                        if(!ctx.music[member.guild.id].paused) {
                            ctx.music[member.guild.id].pause();
                            ctx.music[member.guild.id].autoPause = true;
                        }
                        ctx.music[member.guild.id].noMemberTimer = setTimeout(() => {
                            ctx.music[member.guild.id].end(3)
                        }, ctx.music[member.guild.id].noMemberLeaveTimeout || 60000)
                    } else if(num === 0 && ctx.music[member.guild.id].autoPause) {
                        ctx.music[member.guild.id].lastChannel.createMessage(`<:NyxConfusion:942164350788042772> I was left alone here! I'll stay here for another ${time} in case you still want to listen,,!`)
                    }
                }
            };
        };

        if(!ctx.music[member.guild.id].nextTrackIsReady && ctx.music[member.guild.id].eventEmitter) {
            let ran = false;
            const listener = ctx.music[member.guild.id].eventEmitter.once(`nextTrackIsReady`, run);
            const uniqueID = ctx.music[member.guild.id].uniqueId
            ctx.timeout(10000).then(async () => {
                if(ctx.music[member.guild.id] && ctx.music[member.guild.id].uniqueID == uniqueID) {
                    ctx.music[member.guild.id].eventEmitter.removeListener(`nextTrackIsReady`, listener);
                    if(!ran && ctx.music[member.guild.id]) run();
                }
            })
        } else run();
    }
}

const voiceStateUpdate = async (member, oldState, ctx) => {
    if(!member.guild || !member.id || !member.guild.id) return; // this has happened too many times and fucked nyx
    if(member.id && member.guild) console.debugLog(member.id + ` switched, joined, or left a channel! this is a${ctx.music[member.guild.id] ? ` VALID` : `n INVALID`} statement; ${ctx.music[member.guild.id] ? `there is a session of music playing in the guild of that member` : `there is no music session from the guild of that member.`}`)
    if(ctx.music[member.guild.id]) {
        async function run() {
            if(ctx.music[member.guild.id].finalEndCalled) return;
            await ctx.timeout(150);
            if(ctx.music[member.guild.id] && ctx.music[member.guild.id].channel) {
                const time = await ctx.utils.timeConvert(ctx.music[member.guild.id].noMemberLeaveTimeout || 60000)
                //const num = ctx.music[member.guild.id].channel.voiceMembers.filter(m => m.id !== ctx.bot.user.id && !m.bot).length;
                const num = 1
                //const deafenedMembers = ctx.music[member.guild.id].channel.voiceMembers.filter(m => m.id !== ctx.bot.user.id && m.voiceState.selfDeaf === true).length
                const deafenedMembers = 0
                console.debugLog(num, deafenedMembers)
                if(num === 0 && !ctx.music[member.guild.id].noMemberTimer && !ctx.music[member.guild.id].autoPause) {
                    console.debugLog(`there are no more members in the active channel... started a timer to disconnect`)
                    ctx.music[member.guild.id].lastChannel.createMessage(`<:nyxHi:707987741832642645> I was left alone here! I'll go ahead and pause the queue for now... I'll still be here for another ${time} if you still want to keep listening!`)
                    if(justJoined[member.guild.id]) await ctx.timeout(1500)
                    if(!ctx.music[member.guild.id].paused) {
                        ctx.music[member.guild.id].pause();
                        ctx.music[member.guild.id].autoPause = true;
                    }
                    ctx.music[member.guild.id].noMemberTimer = setTimeout(() => {
                        ctx.music[member.guild.id].end(3)
                    }, ctx.music[member.guild.id].noMemberLeaveTimeout || 60000)
                } else if(num === 0 && ctx.music[member.guild.id].autoPause) {
                    ctx.music[member.guild.id].lastChannel.createMessage(`<:NyxConfusion:942164350788042772> I was left alone here! I'll stay here for another ${time} in case you still want to listen,,!`)
                } else if(num === deafenedMembers && !ctx.music[member.guild.id].autoPause) {
                    console.debugLog(`everyone is deafened in the channel! autopause time.`);
                    if(num === 1) {
                        ctx.music[member.guild.id].lastChannel.createMessage(`<:NyxSporkle:942164351022927922> You deafened yourself, so I'll go ahead and pause this music for ya!`)
                    } else {
                        ctx.music[member.guild.id].lastChannel.createMessage(`<:NyxConfusion:942164350788042772> Everyone is deafened! I'll go ahead and pause this music for everyone!`)
                    }
                    if(justJoined[member.guild.id]) await ctx.timeout(2500)
                    if(!ctx.music[member.guild.id].paused) {
                        ctx.music[member.guild.id].pause();
                        ctx.music[member.guild.id].autoPause = true;
                    }
                } else if(ctx.music[member.guild.id].autoPause && num !== 0 && num !== deafenedMembers) {
                    console.debugLog(`there is a leave timer active, and the count is not 0! removing...`)
                    clearTimeout(ctx.music[member.guild.id].noMemberTimer);
                    ctx.music[member.guild.id].noMemberTimer = null;
                    if(ctx.music[member.guild.id].autoPause) {
                        console.debugLog(`the song was automatically paused when there were 0 people listening! [A] let's just go ahead and resume it...`);
                        ctx.music[member.guild.id].lastChannel.createMessage(`<:NyxSing:942164350649663499> Welcome back! I took the liberty of automatically resuming your queue!`)
                        await ctx.timeout(300)
                        ctx.music[member.guild.id].resume();
                    }
                }
            }
        }

        if(!ctx.music[member.guild.id].nextTrackIsReady && ctx.music[member.guild.id].eventEmitter) {
            let ran = false;
            const listener = ctx.music[member.guild.id].eventEmitter.once(`nextTrackIsReady`, run);
            const uniqueID = ctx.music[member.guild.id].uniqueId
            ctx.timeout(10000).then(async () => {
                if(ctx.music[member.guild.id] && ctx.music[member.guild.id].uniqueID == uniqueID) {
                    ctx.music[member.guild.id].eventEmitter.removeListener(`nextTrackIsReady`, listener);
                    if(!ran && ctx.music[member.guild.id]) run();
                }
            })
        } else run();
    }
};

const a = (member, newc, ctx) => voice(member, newc, undefined, ctx, `join`)
const b = (member, newc, ctx) => voice(member, newc, undefined, ctx, `leave`)
const c = (member, newc, oldc, ctx) => voice(member, newc, oldc, ctx, `switch`);

module.exports = [
    {
        event: "voiceChannelJoin",
        bypass: true,
        func: a
    },
    {
        event: "voiceChannelLeave",
        bypass: true,
        func: b
    },
    {
        event: "voiceChannelSwitch",
        bypass: true,
        func: c
    },
    {
        event: "voiceStateUpdate",
        bypass: true,
        func: voiceStateUpdate
    },
    {
        event: "messageCreate",
        bypass: true,
        func: async (msg, ctx) => {
            if(msg.attachments && msg.attachments.size > 0) {
                console.d(`[MSG: ${msg.id}] This message has ${msg.attachments.size} attachments!`)
                if((await ctx.utils.lookupGuild(ctx, msg.channel.guild.id, true)).loggingmessage) {
                    console.d(`[MSG: ${msg.id}] Server has message logging enabled! Caching ${msg.attachments.size} files`)

                    for (attachment of msg.attachments) {
                        const message = await new Promise(async res => {
                            ctx.libs.superagent.post(ctx.config.cacheApi + `saveFile`).set(`auth`, ctx.config.keys.cacheApi).send({url: attachment.url}).then(r => {res(`Successfully sent cache request!`)}).catch(e => {
                                ctx.libs.superagent.post(ctx.config.cacheApi + `saveFile`).set(`auth`, ctx.config.keys.cacheApi).send({url: attachment.url}).then(r => {res(`Successfully sent cache request!`)}).catch(e => {
                                    ctx.libs.superagent.post(ctx.config.cacheApi + `saveFile`).set(`auth`, ctx.config.keys.cacheApi).send({url: attachment.url}).then(r => {res(`Successfully sent cache request!`)}).catch(e => {res(`Failed to cache request: ${e}`)})
                                })
                            })
                        });
                        console.d(`[MSG: ${msg.id}] ` + message)
                    }
                } else console.d(`[MSG: ${msg.id}] Server does not have message logging enabled! Skipping upload.`)
            }
        }
    }
];