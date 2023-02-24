const parseInvite = (invite) => {
    return {
        code: invite.code,
        inviter: typeof invite.inviter == `object` ? invite.inviter.id : invite.inviter,
        uses: invite.uses,
        memberCount: invite.memberCount
    }
};

let recentInviteCreations = {};

const parseChanges = (oldArr, newArr) => {
    //console.log(`Getting changes of:`, oldArr.map(parseInvite), newArr.map(parseInvite))

    let obj = {};

    newArr.forEach(o => {
        const old = oldArr.find(a => a.code == o.code);

        if(old) {
            obj[o.code] = Object.assign({}, o, {
                updatedUses: o.uses - old.uses
            })
        } else {
            obj[o.code] = Object.assign({}, o, {
                updatedUses: o.uses
            })
        }
    })

    //console.log(`Changes:`, obj)

    return obj;
}

module.exports = ({ ctx, id, invite, purge }) => new Promise(async res => {
    if(purge) {
        const guild = await ctx.utils.lookupGuild(ctx, id, true);

        if(guild.loggingInvitesArray != `[]`) {
            ctx.utils.updateGuild(ctx, id, {
                loggingInvitesArray: `[]`
            }).then(() => {
                res({})
                console.log(`Updated guild invites in DB! (${id})`)
            }).catch(e => {
                res(null)
                console.warn(`Failed to update guild invites in DB: ${e} (${id})`)
            })
        }
    } else if(invite) {
        const guild = await ctx.utils.lookupGuildOrCreate(ctx, id, true);

        let arr = []

        try {
            arr = JSON.parse(guild.loggingInvitesArray)
        } catch(e) {
            console.error(`Failed parsing loggingInvitesArray for id ${id}: ${e}\n\n- ${guild.loggingInvitesArray}`);
        }

        let invArr = typeof invite == `object` && typeof invite.length == `number` ? invite : [invite];

        let tempArr = invArr.map(parseInvite)

        if(!recentInviteCreations[id]) recentInviteCreations[id] = [];

        recentInviteCreations[id].push(...tempArr);

        arr.push(...invArr);

        const changes = parseChanges(JSON.parse(guild.loggingInvitesArray), arr)
    
        ctx.utils.updateGuild(ctx, id, {
            loggingInvitesArray: JSON.stringify(arr.map(parseInvite))
        }).then(() => {
            console.log(`Updated guild invites in DB!`)
            res(changes);

            const index = recentInviteCreations[id].findIndex(o => o.code == tempArr[0].code);

            console.log(`Removing ${tempArr.length} entry/ies at index ${index} (${id})`);

            recentInviteCreations[id].splice(index, tempArr.length);

            if(recentInviteCreations[id].length == 0) {
                console.log(`No items left in recent invites! Deleting object (${id})`);
                delete recentInviteCreations[id];
            }
        }).catch(e => {
            console.warn(`Failed to update guild invites in DB: ${e} (${id})`)
            res(null)
        })
    } else {
        const guild = await ctx.utils.lookupGuildOrCreate(ctx, id, true);

        const invitesArray = await ctx.bot.guilds.get(id).getInvites();

        const changes = parseChanges(JSON.parse(guild.loggingInvitesArray), [...invitesArray, ...(recentInviteCreations[id] || [])])
    
        ctx.utils.updateGuild(ctx, id, {
            loggingInvitesArray: JSON.stringify(invitesArray.map(parseInvite))
        }).then(() => {
            console.log(`Updated guild invites in DB! (${id})`)
            res(changes)
        }).catch(e => {
            console.warn(`Failed to update guild invites in DB: ${e}`)
            res(null)
        })
    }
})