module.exports = {
    "name": "treble",
    "desc": "Set the treble multiplier for your server!",
    "args": [
        {
            "opt": true,
            "arg": "multiplier to set; range of -5 - 5"
        }
    ],
    "permission": 3,
    "aliases": [
        "settreble",
        "treblemultiplier",
        "treblemult"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 4,
                "name": "multiplier",
                "description": "The new multiplier.",
                "required": false
            }
        ]
    },
    func: async function settreble(ctx, msg, args) {
        if(!ctx.music[msg.channel.guild.id] || !ctx.music[msg.channel.guild.id].queue) {return msg.reply(`${ctx.fail} I'm not playing anything!`)};
        let pending = ctx.music[msg.channel.guild.id].eq.next
        if(!args[0]) return msg.reply(`Currently, the treble's multiplier is set to **${ctx.music[msg.channel.guild.id].eq.treble}x**${pending && pending.treble != ctx.music[msg.channel.guild.id].eq.treble ? `, but it is going to be set to **${pending.treble}x** when this song finishes!` : ``}\nUsage: \`${msg.prefix}${this.usage.replace(';', '')}\``)
        if(msg.channel.guild.me.voiceState && msg.member.voiceState && msg.channel.guild.me.voiceState.channelID && msg.member.voiceState.channelID && (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID)) {return msg.reply(`${ctx.fail} You must be in my voice channel before you can use this!`)}
    
        let n = `${args[0]}`;
        if(n.toLowerCase().endsWith(`x`)) {n = n.substring(0, n.length-2);}
        if(!n || isNaN(n) || isNaN(Number(n))) return msg.reply(`${ctx.fail} Usage: \`${msg.prefix}${this.usage.replace(';', '')}\``);
        const num = Number(n.substring(0, 5));
        if(num > 5) return msg.reply(`${ctx.fail} The multiplier cannot be greater than 5!`);
        if(num < -5) return msg.reply(`${ctx.fail} The multiplier cannot be less than -5!`);
    
        if(!ctx.music[msg.channel.guild.id].eq.next) ctx.music[msg.channel.guild.id].eq.next = JSON.parse(JSON.stringify(ctx.music[msg.channel.guild.id].eq));
    
        ctx.music[msg.channel.guild.id].eq.next.treble = num
    
        ctx.music[msg.channel.guild.id].refreshEq()
    
        return msg.reply(`${ctx.pass} Successfully set the multiplier to **${ctx.music[msg.channel.guild.id].eq.next.treble}x!**\nThis change should apply within the next few seconds.`)
    }
}