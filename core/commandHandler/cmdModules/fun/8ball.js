const responses = [
    "yup.", 
    "i mean, it could happen.", 
    "there's a chance", 
    "try harder.",  
    "of course!", 
    "mayhaps", 
    "possibly", 
    "nope", 
    "give a better question than that", 
    "can't hear u, i'm blasting naku's music", 
    "sure, why not", 
    "lmao nah", 
    "i mean it'd be cool if it were possible", 
    "weird question, but go off sister", 
    "maybe in another timeline", 
    "ask again never", 
    "i really don't know how to respond", 
    "probably not, but off topic; have you heard of megalovania?", 
    "this is a wendy's drive through", 
    "no."
];

const func = (interaction) => interaction.reply({
    content: responses[Math.floor((Math.random() * responses.length))]
});

module.exports = {
    func,
    interaction: new (require('@discordjs/builders').SlashCommandBuilder)()
        .setDescription(`the most trustworthy system to ask a question.`)
        .setDefaultPermission(true)
        .addStringOption(s => {
            s.setName(`query`);
            s.setDescription(`What would you like to ask the "Most Trustworthy System?"`)
            s.setRequired(true);

            return s;
        })
}