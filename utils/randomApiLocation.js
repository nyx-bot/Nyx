let locationNumber = 0;

module.exports = (ctx) => {
     let link = ctx.musicApi.locations[locationNumber];

     console.d(`serving location #${locationNumber}`)

     locationNumber++;

     console.d(`next: ${ctx.musicApi.locations[locationNumber]} // ${locationNumber}`)

     if(!ctx.musicApi.locations[locationNumber]) locationNumber = 0;

     return link;
}