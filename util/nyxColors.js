module.exports = (color) => {
    let colors = {
         purple_dark: "#2b0e47",
         purple_medium: "#612f91",
         purple: "#612f91",
         purple_light: "#8340c2",
         red_dark: "#8e2430",
         red_light: "#f94343",
         white: "#f9f9f6",
         blurple: "#7289DA",
         gray: "#545454",
         red: "#eb4034",
         green: "#34eb89",
         gold: "#ffb812",
         soundcloud: "#FE5000",
         spotify: "#1DB954",
         youtube: `#FF0000`,
         random: ["#612F91", "#B43187", "#EB5072", "#FF845C"],
    };
    if(color == "random") {
         return parseInt(
              colors.random[
                   Math.floor(Math.random() * colors.random.length)
              ].replace("#", ""),
              16
         );
    } else if(colors[color]) {
         return parseInt(colors[color].replace("#", ""), 16);
    } else {
         return parseInt(`${color}`.replace('#', '').match(/[a-zA-Z\d]*/), 16);
    }
};