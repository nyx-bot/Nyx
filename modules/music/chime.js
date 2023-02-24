module.exports = {
    "name": "chime",
    "desc": "Enable or disable Nyx's chime while playing music!",
    "args": [
        {
            "opt": true,
            "arg": "enable / disable"
        }
    ],
    "permission": 3,
    "aliases": [
        "musictone",
        "musictones",
        "musicchime",
        "chimes",
        "musicchimes"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 5,
                "name": "enabled",
                "description": "Whether or not the chime is enabled.",
                "required": false
            }
        ]
    },
    func: async function chime(ctx, msg, args) {
        let guildSetting = await ctx.utils.lookupGuildOrCreate(ctx, msg.channel.guild.id);
        if(!args[0]) {
            return msg.reply(`Currently, my chimes are **${guildSetting.dataValues.musicChime ? `Enabled` : `Disabled`}**!\nYou can change the status using \`${this.usage}\``)
        } else {
            if(!args.join('').toLowerCase().includes(`enable`) && !args.join('').toLowerCase().includes(`true`) && !args.join('').toLowerCase().includes(`disable`) && !args.join('').toLowerCase().includes(`false`)) return msg.reply(`${ctx.fail} Usage: \`${this.usage}\``);
            await guildSetting.update({musicChime: args.join('').toLowerCase().includes(`enable`) || args.join('').toLowerCase().includes(`true`) ? true : false}, {
                where: {
                    id: msg.channel.guild.id
                }
            });
            guildSetting.save().then(res => res.toJSON()).then(async res => {
                return msg.reply(`<:NyxSing:942164350649663499> Successfully ${res.musicChime ? `enabled` : `disabled`} the music chimes!`)
            })
        }
    }
}