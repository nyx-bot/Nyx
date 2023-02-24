module.exports = {
    "name": "button",
    "desc": "support ur Momm!!!!",
    func: async (ctx, msg, args) => {
        if(ctx.elevated.find(id => id == msg.author.id)) {
            msg.reply({content: `testing`, components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "Yup!",
                            style: 4,
                            customID: "volyes"
                        },
                        {
                            type: 2,
                            label: "Nope.",
                            style: 2,
                            customID: "volnop"
                        },
                    ]
                }
            ]})
        }
    }
}