const opt = {
    owoMode: false,
}
module.exports = (content, options) => {
    options = Object.assign(opt, typeof options == `object` ? options : {});

    console.d(`Parsing content with options:`, options)

    if(typeof content[0] == `string`) {
        content[0] = {
            content: content[0]
        }
    };

    if(options.owoMode) {content[0].content = ctx.utils.owoify(content[0].content)};

    if(content[0] && content[0].embed) {
        console.d(`Message object has classic "embed property"...`)
        if(content[0].embeds) {
            console.d(`Appending embed property to existing embeds array!`)
            content[0].embeds.push(content[0].embed);
        } else {
            console.d(`Creating embeds array!`)
            content[0].embeds = [content[0].embed]
        }
        delete content[0].embed;
    };

    if(content[0].embeds && content[0].embeds.length > 0) content[0].embeds = content[0].embeds.map(embed => {
        if(embed && typeof embed.color == `string`) embed.color = utils.colors(embed.color);

        if(options.owoMode) {
            Object.keys(embed).forEach(key => {
                if((key != `fields` || key != `color` || key != `footer` || key != `fields`) && typeof embed[key] == `string`) {
                    const t = ctx.utils.owoify(embed[key])
                    embed[key] = t;
                } else if(key == `fields` && embed[key].forEach) {
                    for(i in embed.fields) {
                        const obj = embed.fields[i]
                        obj.name = ctx.utils.owoify(obj.name)
                        obj.value = ctx.utils.owoify(obj.value)
                    }
                } else if(key == `footer` && embed.footer.text) {
                    embed.footer.text = ctx.utils.owoify(embed.footer.text);
                }
            });
        }

        return embed;
    });

    if(content.length > 1) {
        content[0].attachments = content.slice(1).map(o => {
            return {
                name: o.name,
                contents: o.file || o.contents
            }
        });
        content.splice(1, content.length-1)
    };

    console.d(content)

    return content
}