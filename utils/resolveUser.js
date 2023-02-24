module.exports = function(id) {
     return new Promise((res, rej) => {
          if(id.match(/\d+/)) {id = id.match(/\d+/)[0]}
          ctx.rest.getRESTUser(id).then(res).catch(rej)
     })
}