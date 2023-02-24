module.exports = {
    "name": "8ball",
    "desc": "the most trustworthy system to ask a question.",
    "args": [
        {
            "opt": false,
            "arg": "question"
        }
    ],
    "example": [
        "`;8ball will i ever find love`\n\n- \"sir, this is a wendy's drive through\"",
        "`;8ball am i cool`\n\n- \"give a better question than that\""
    ],
    "aliases": [
        "8b"
    ],
    "interactionObject": {
        "options": [
            {
                "type": 3,
                "name": "question",
                "description": "What to query the magic 8ball",
                "required": true
            }
        ]
    },
    func: async function(ctx, msg, args) {
        if(!args[0]) {return msg.reply(`ask something.`)}
        let replyArray = ["yup.", "i mean, it could happen.", "there's a chance", "try harder.",  "of course!", "mayhaps", "possibly", "nope", "give a better question than that", "can't hear u, i'm blasting jacob sartorius", "sure, why not", "lmao nah", "i mean it'd be cool if it were possible", "weird question, but go off sister", "maybe in another timeline", "ask again never", "damn, i really don't know how to respond", "probably not, but off topic; have you heard of megalovania?", "give me a question that i'd possibly care about", "sir, this is a wendy's drive through", "no."]
    
        msg.reply(replyArray[Math.floor((Math.random() * replyArray.length))]);
    }
}