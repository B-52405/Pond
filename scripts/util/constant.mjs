const [height, width] = [6, 6]
const red_line = 2

function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

export {
    height,
    width,
    red_line,
    deepcopy
}
