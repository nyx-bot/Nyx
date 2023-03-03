const superagent = require('superagent')
const cp = require('child_process')

module.exports = class MusicAPI {
    constructor(location, token) {
        if(token && location) {
            this.token = token;

            if(location.endsWith(`/`)) location = location.slice(0, -1);

            this.location = location;
        } else throw new Error(`No location and/or token was provided!`)
    }

    createRequest = ({ func, query, body, noBody }) => new Promise(async (res, rej) => {
        let url = `${this.location}/${func}` + query ? `/${query}` : ``;

        const req = superagent[body ? `post` : `get`](url).set(`authorization`, this.token);

        if(body) req.send(body);

        req.then(r => {
            if(r.body && !noBody) {
                res(r.body)
            } else res(r)
        });

        req.catch(e => {
            if(e.body && !noBody) {
                rej(e.body)
            } else rej(e)
        })
    })
}