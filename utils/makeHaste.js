module.exports = async function (ctx, msg, content, txt) {
     ctx.libs.superagent
          .post("https://haste.soulja-boy-told.me/documents")
          .send(content)
          .then((res) => {
               let key = res.body.key;
               msg.reply(
                    `${txt}https://haste.soulja-boy-told.me/${key}.js`
               );
          })
          .catch((e) => {
               msg.reply(`Could not upload to hast =)`);
          });
}