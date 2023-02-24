module.exports = async (ctx, interaction) => {
    if(ctx.readyPromise) {
        console.log(`Interaction was called before bot was considered ready!`);

        const interactionTypes = [
            `to handle this ping`, `to run any commands`, `to handle any buttons`
        ]

        //const int = await interaction.defer(64);
        await interaction.createMessage({
            flags: 64,
            content: `${ctx.processing} I'm not ready ${interactionTypes[interaction.type-1] || `to handle this`} just yet! (I recently had a restart)\n\nGive me a few more minutes before I can do this...`
        });

        interaction.createMessage = (...args) => interaction.editOriginal(...args)

        if(ctx.readyPromise) {
            console.log(`Bot is still starting, waiting it out...`)
            await ctx.readyPromise;
            console.log(`readyPromise has completed! (interaction) Continuing...`)
        } else console.log(`readyPromise seemed to have completed while creating that message! Continuing...`)

        ctx.core.interactionHandler(ctx, interaction)
    } else ctx.core.interactionHandler(ctx, interaction)
}