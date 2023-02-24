module.exports = {
    "name": "links",
    "desc": "Get some useful links from me!",
    "args": [],
    "aliases": [
        "inv",
        "invite",
        "commands",
        "cmds",
        "server",
        "donate"
    ],
    "interactionObject": {},
    func: async function links(ctx, msg, args) {
        let embed = {
            title: `Useful Links!`,
            description: `[<:nyxGlow:699353048182685766> **Commands**](https://nyx.bot/commands)\n[<:nyx:732595012617109531> **My server!**](https://nyx.bot/server)\n[<:nyxHeart:702273388390908025> **Invite me to your server!**](https://nyx.bot/i)\n[<:NyxLove:942164350964228167> **Support me!** (Patreon)](https://www.patreon.com/NyxBot)\n\n[📜 **__Terms of Service__**](https://nyx.bot/terms)\n[📜 **__Your Privacy__**](https://nyx.bot/privacy)`,
            color: ctx.utils.colors('random')
        }
        return msg.reply({embed})
    }
}