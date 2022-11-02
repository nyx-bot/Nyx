module.exports = (interaction) => new Promise(async res => {
    interaction.received = Date.now();
    console.log(interaction)
})