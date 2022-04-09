module.exports = (array) => array.sort((a, b) => {
    //-1 = sort A before B
    // 0 = keep original order
    // 1 = sort B before A

    let one = a, two = b

    if(a !== `string` && a[0] == `string`) {
        one = a[0]
    }; if(b !== `string` && b[0] == `string`) {
        two = b[0]
    }; 

    //if there's one that's a number, and one that's not, the number goes first.

    if(one[0].match(/\d/) && !two[0].match(/\d/)) return -1 // if the first matches a number, and the second doesn't, first goes before.
    if(two[0].match(/\d/) && !one[0].match(/\d/)) return 1 // vice versa.
})