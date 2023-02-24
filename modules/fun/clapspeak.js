module.exports = {
    "name": "clapspeak",
    "desc": "Turn 👏 your 👏 message 👏 into 👏 this 👏 abomination",
    "args": [
        {
            "opt": false,
            "arg": "message to translate"
        }
    ],
    "example": "`;clapspeak you're an amazing person`\n\n- YOU'RE 👏 AN 👏 AMAZING 👏 PERSON :triumph::ok_hand::ok_hand:",
    "aliases": [
        "clapspeek"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "message",
                "description": "The message to translate",
                "required": true
            }
        ]
    },
    func: async function (ctx, msg, args) {
        if(!args[0]) return msg.reply(`Give me a message to TURN 👏 INTO 👏 AN 👏 ABOMINATION`)
        var m = args.slice(0).join(" 👏 ").toUpperCase().replace(/👏/g, '👏')
        var e1 = [`:muscle:`, `:punch:`, ``]
        let result1 = Math.floor((Math.random() * e1.length))
        var e2 = [`:weary:`, `:pensive:`, `:triumph:`, `:hot_face:`]
        let result2 = Math.floor((Math.random() * e2.length))
        var e3 = [`:ok_hand:`, `:ok_hand::ok_hand:`, `:sweat_drops:`, ``]
        let result3 = Math.floor((Math.random() * e3.length))
        var emoji1 = e1[result1];var emoji2 = e2[result2];var emoji3 = e3[result3]
        if((e1 == '') && (e3 == '')) {emoji2 = e2[result2] + e2[result2]}
        var ending = emoji1 + emoji2 + emoji3
        var message = m + ` ${ending}`
        msg.reply(message)
    }
}