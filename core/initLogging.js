module.exports = () => {
    let logChannels = [`log`, `info`, `debug`, `warn`, `error`];

    const logs = logChannels.map(name => {
        return {
            name,
            send: (...args) => args.map(msg => {
                return (typeof msg == `string` ? msg : require("util").inspect(msg, { depth: 0 })).split(`\n`)
            }).forEach(array => array.forEach(msg => process.send({ name, msg })))
        }
    });

    let outputs = {};

    logs.forEach(channel => {
        let name = channel.name
        if(name == `info`) name = `log`;
        outputs[name] = (...args) => channel.send(...args)
    });
    
    Object.keys(outputs).forEach(name => {
        console[name] = outputs[name];
        console[name[0]] = outputs[name]
        console[name](`Testing console.${name} (also setting console.${name[0]})`)
    })

    console.log(`Successfully set up logging channels!`)
}