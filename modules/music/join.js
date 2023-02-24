module.exports = {
    "name": "join",
    "desc": "Let Nyx join your voice channel to play music!",
    "args": [],
    "aliases": [
        "connect",
        "c"
    ],
    "interactionObject": {},
    func: async function join(ctx, msg, args) {
        if(!msg.member.voiceState) return msg.reply(`${ctx.fail} You must be in a voice channel before you can use this!`);
        if(ctx.music[msg.channel.guild.id]) return msg.reply(`${ctx.fail} I'm already in another voice channel!`);
        
        let j;
        j = await ctx.utils.music.joinChannel(ctx, msg);

        let content = {
            content: `<:NyxSing:942164350649663499> Successfully joined your voice channel!`
        }

        let lastPlayed = [];

        try {
            lastPlayed = JSON.parse(msg.channel.guild.guildSetting.musicLastPlayed);
        } catch(e) {
            console.w(`Failed to read musicLastPlayed in join func! ${e}`);
        };

        if(lastPlayed.length > 0) {
            content = Object.assign({}, content, {
                embeds: [
                    {
                        title: `Recently played tracks`,
                        color: ctx.utils.colors(`random`),
                        description: `> ` + lastPlayed.map(o => `1. \`${ctx.utils.escapeDiscordsFuckingEditing(ctx.utils.time(o.duration[0]).timestamp)}\` **[${ctx.utils.escapeDiscordsFuckingEditing(o.name)}](${o.link})**`).join(`\n\n> `),
                        footer: {
                            text: `You can also use ${msg.prefix}play (list of numbers) to queue a specific collection of songs from this list, just like when you search for music!`
                        }
                    }
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 1,
                                emoji: {
                                    name: ctx.emoji.nyx.sing.split(`:`).slice(1,2)[0],
                                    id: ctx.emoji.nyx.sing.split(`:`).slice(2,3)[0].split(`>`)[0],
                                },
                                label: `Add every song to queue!`,
                                customID: "play-all",
                                disabled: false,
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: lastPlayed.map((o, index) => {
                            return {
                                type: 2,
                                style: 2,
                                label: `Play ${o.name.split(` - `).slice(1).join(` - `).length > 50 ? `${o.name.split(` - `).slice(1).join(` - `).substring(0, 45)}...` : o.name.split(` - `).slice(1).join(` - `)}`,
                                customID: `play-${index+1}`,
                                disabled: false,
                            }
                        })
                    }
                ]
            })
        };
        
        ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`] = {source: `join`, results: lastPlayed.map(o => {
            return {
                title: o.name.split(` - `).slice(1).join(` - `),
                artists: [o.name.split(` - `)[0]],
                duration: o.duration,
                url: o.link,
                thumbnail: o.thumbnail || `https://i.nyx.bot/null.png`,
                from: o.from || `link`
            }
        }), author: msg.author.id, timeout: 30000};

        ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].m = await j.edit(content);

        ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`].remove = {
            auto: setTimeout(() => {}, 0),
            finish: async function(arg) {
                delete ctx.music[`search${msg.author.id}-${msg.channel.guild.id}`];
                if(arg === 1) await j.edit(Object.assign({}, content, { components: [] }))
            }
        }
    }
}