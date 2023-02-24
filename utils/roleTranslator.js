module.exports = function (string) {
     string = string.replace(/guild|Guild/g, "Server");
     return (string.charAt(0).toUpperCase() + string.slice(1))
          .match(/[A-Z][a-z]+/g)
          .join(" ");
}