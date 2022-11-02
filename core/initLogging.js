module.exports = () => {
    let logChannels = [`log`, `info`, `debug`, `warn`, `error`];

    const logs = logChannels.map(name => {
        return {
            name,
            send: (...args) => args.forEach(msg => process.send({ name, msg }))
        }
    });

    let outputs = {};

    logs.forEach(channel => {
        let name = channel.name
        if(name == `log`) name = `debug`;
        if(name == `info`) name = `log`
        outputs[name] = (...args) => channel.send(...args)
    });
    
    Object.keys(outputs).forEach(name => {
        console[name] = outputs[name];
        console[name](`Testing console.${name}`)
    })

    console.log(`Successfully set up logging channels!`)
}