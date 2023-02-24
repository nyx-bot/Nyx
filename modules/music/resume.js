module.exports = {
    "name": "resume",
    "desc": "Resume the currently playing song!",
    "args": [],
    "aliases": [
        "re",
        "continue",
        "res"
    ],
    "interactionObject": {},
    func: async function resume(ctx, msg, args) { ctx.cmds.get('pause').func(ctx, msg, args) }
}