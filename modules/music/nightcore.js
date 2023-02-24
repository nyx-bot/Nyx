module.exports = {
    "name": "nightcore",
    "desc": "Toggle nightcore mode for your current music queue!",
    "args": [
        {
            "opt": true,
            "arg": "enable or disable"
        }
    ],
    "permission": 3,
    "aliases": [
        "togglenightcore",
        "nc"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "mode",
                "customID": "mode",
                "options": [
                    {
                        label: `Enabled`,
                        value: `enabled`,
                        description: `Enable nightcore mode for the current music session`
                    },
                    {
                        label: `Disabled`,
                        value: `disabled`,
                        description: `Disable nightcore mode for the current music session`
                    },
                ],
                "description": "The new multiplier.",
                "required": false
            }
        ]
    },
    func: async function togglenightcore(ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue) {return msg.reply(`${ctx.fail} I'm not playing anything!`)}

        let arg = `${args[0]}`.toLowerCase()

        const enabled = ctx.music[msg.channel.guild.id].eq.samplemult == 1.15 ? true : false;
        const enabledNext = (ctx.music[msg.channel.guild.id].eq.next || ctx.music[msg.channel.guild.id].eq).samplemult == 1.15 ? true : false;

        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
    
        if(!args[0]) {
            return msg.reply(`Nightcore is currently **${enabled ? `enabled` : `disabled`}**${enabledNext != enabled ? `, and is set to be **${enabledNext ? `enabled` : `disabled`}** on the next track.` : ``}`)
        } else if (arg == `enabled` || arg == `enable` || arg == `on` || arg == `true`) {
            if(!ctx.music[msg.channel.guild.id].eq.next) ctx.music[msg.channel.guild.id].eq.next = JSON.parse(JSON.stringify(ctx.music[msg.channel.guild.id].eq));
            ctx.music[msg.channel.guild.id].eq.next.samplemult = 1.15;
            return msg.reply(`${ctx.pass} Successfully enabled nightcore mode for next song!`)
        } else if (arg == `disabled` || arg == `disable` || arg == `off` || arg == `false`) {
            if(!ctx.music[msg.channel.guild.id].eq.next) ctx.music[msg.channel.guild.id].eq.next = JSON.parse(JSON.stringify(ctx.music[msg.channel.guild.id].eq));
            if(ctx.music[msg.channel.guild.id].eq.next.samplemult == 1.15) {
                ctx.music[msg.channel.guild.id].eq.next.samplemult = null;
                return msg.reply(`${ctx.pass} Successfully disabled nightcore mode for next song!`)
            } else if (!ctx.music[msg.channel.guild.id].eq.next.samplemult) {
                return msg.reply(`${ctx.fail} All speed effects are already set as disabled.`)
            } else {
                return msg.reply(`${ctx.fail} Nightcore mode isn't enabled!`)
            }
        } else return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``);
    }
}