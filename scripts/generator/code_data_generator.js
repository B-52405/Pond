const { stringify_and_write_json } = require("../util/json_util_commonjs.js")

const CODE = (() => {
    let code = {}
    let code_names = ["EMPTY", "V1", "V2", "VL1", "VL2", "VL3", "H1", "H2", "HL1", "HL2", "HL3", "START"]
    for (let i = 0; i < code_names.length; i++) {
        code[code_names[i]] = i
    }
    return code
})()

const BAR_COLOR = {
    RED: "#EE5746",
    YELLOW: "#FFB62C",
    BLUE: "#0081E6",
    EMPTY: "white"
}
const bmg = "10px"
const bbr = "5px"

const code_map = {
    [CODE.EMPTY]: 0,
    [CODE.START]: undefined,
    [CODE.V1]: 1,
    [CODE.V2]: 1,
    [CODE.VL1]: 1,
    [CODE.VL2]: 3,
    [CODE.VL3]: 1,
    [CODE.H1]: 2,
    [CODE.H2]: 2,
    [CODE.HL1]: 2,
    [CODE.HL2]: 3,
    [CODE.HL3]: 2
}

const bar_length = {
    [CODE.EMPTY]: undefined,
    [CODE.START]: undefined,
    [CODE.V1]: 2,
    [CODE.V2]: 2,
    [CODE.VL1]: 3,
    [CODE.VL2]: 3,
    [CODE.VL3]: 3,
    [CODE.H1]: 2,
    [CODE.H2]: 2,
    [CODE.HL1]: 3,
    [CODE.HL2]: 3,
    [CODE.HL3]: 3
}

const bar_code = {
    [CODE.EMPTY]: [],
    [CODE.START]: [],
    [CODE.V1]: [CODE.V1, CODE.V2],
    [CODE.V2]: [CODE.V2, CODE.V1],
    [CODE.VL1]: [CODE.VL1, CODE.VL2, CODE.VL3],
    [CODE.VL2]: [],
    [CODE.VL3]: [CODE.VL3, CODE.VL2, CODE.VL1],
    [CODE.H1]: [CODE.H1, CODE.H2],
    [CODE.H2]: [CODE.H2, CODE.H1],
    [CODE.HL1]: [CODE.HL1, CODE.HL2, CODE.HL3],
    [CODE.HL2]: [],
    [CODE.HL3]: [CODE.HL3, CODE.HL2, CODE.HL1]
}

const code_style_map = (() => {
    let code_style_map = {
        [CODE.EMPTY]: [`0px 0px 0px 0px`, `0 0 0 0`, BAR_COLOR.EMPTY],
        [CODE.START]: [`${bmg} ${bmg} ${bmg} ${bmg}`, `${bbr} ${bbr} ${bbr} ${bbr}`, BAR_COLOR.YELLOW],
        [CODE.V1]: [`${bmg} ${bmg} 0px ${bmg}`, `${bbr} ${bbr} 0 0`, BAR_COLOR.YELLOW],
        [CODE.V2]: [`0px ${bmg} ${bmg} ${bmg}`, `0 0 ${bbr} ${bbr}`, BAR_COLOR.YELLOW],
        [CODE.VL1]: [`${bmg} ${bmg} 0px ${bmg}`, `${bbr} ${bbr} 0 0`, BAR_COLOR.BLUE],
        [CODE.VL2]: [`0px ${bmg} 0px ${bmg}`, `0 0 0 0`, BAR_COLOR.BLUE],
        [CODE.VL3]: [`0px ${bmg} ${bmg} ${bmg}`, `0 0 ${bbr} ${bbr}`, BAR_COLOR.BLUE],
        [CODE.H1]: [`${bmg} 0px ${bmg} ${bmg}`, `${bbr} 0 0 ${bbr}`, BAR_COLOR.YELLOW],
        [CODE.H2]: [`${bmg} ${bmg} ${bmg} 0px`, `0 ${bbr} ${bbr} 0`, BAR_COLOR.YELLOW],
        [CODE.HL1]: [`${bmg} 0px ${bmg} ${bmg}`, `${bbr} 0 0 ${bbr}`, BAR_COLOR.BLUE],
        [CODE.HL2]: [`${bmg} 0px ${bmg} 0px`, `0 0 0 0`, BAR_COLOR.BLUE],
        [CODE.HL3]: [`${bmg} ${bmg} ${bmg} 0px`, `0 ${bbr} ${bbr} 0`, BAR_COLOR.BLUE]
    }
    for (let code in code_style_map) {
        code_style_map[code] = {
            margin: code_style_map[code][0],
            "border-radius": code_style_map[code][1],
            "background-color": code_style_map[code][2]
        }
    }
    code_style_map[CODE.EMPTY]["visibility"] = "hidden"
    return (code) => {
        return code_style_map[code]
    };
})()

const bar_coord_map = (() => {
    let bar_coord_map = {
        [CODE.EMPTY]: [],
        [CODE.START]: [],
        [CODE.V1]: [[0, 0], [1, 0]],
        [CODE.V2]: [[0, 0], [-1, 0]],
        [CODE.VL1]: [[0, 0], [1, 0], [2, 0]],
        [CODE.VL2]: [[-1, 0], [0, 0], [1, 0]],
        [CODE.VL3]: [[0, 0], [-1, 0], [-2, 0]],
        [CODE.H1]: [[0, 0], [0, 1]],
        [CODE.H2]: [[0, 0], [0, -1]],
        [CODE.HL1]: [[0, 0], [0, 1], [0, 2]],
        [CODE.HL2]: [[0, -1], [0, 0], [0, 1]],
        [CODE.HL3]: [[0, 0], [0, -1], [0, -2]]
    }
    return (code) => {
        return bar_coord_map[code]
    }
})()

const code_direction_map = (() => {
    let directions = {
        vertical: {
            y: 1,
            x: 0
        },
        horizontal: {
            y: 0,
            x: 1
        }
    }
    let code_direction_map = {
        [CODE.EMPTY]: undefined,
        [CODE.START]: undefined,
        [CODE.V1]: directions.vertical,
        [CODE.V2]: directions.vertical,
        [CODE.VL1]: directions.vertical,
        [CODE.VL2]: directions.vertical,
        [CODE.VL3]: directions.vertical,
        [CODE.H1]: directions.horizontal,
        [CODE.H2]: directions.horizontal,
        [CODE.HL1]: directions.horizontal,
        [CODE.HL2]: directions.horizontal,
        [CODE.HL3]: directions.horizontal
    }
    return (code) => {
        return code_direction_map[code]
    }
})()

const code_facing = {
    [CODE.EMPTY]: undefined,
    [CODE.START]: undefined,
    [CODE.V1]: [-1, 0],
    [CODE.V2]: [1, 0],
    [CODE.VL1]: [-1, 0],
    [CODE.VL2]: undefined,
    [CODE.VL3]: [1, 0],
    [CODE.H1]: [0, -1],
    [CODE.H2]: [0, 1],
    [CODE.HL1]: [0, -1],
    [CODE.HL2]: undefined,
    [CODE.HL3]: [0, 1]
}

const code_redable_map = (() => {
    const code_redable_map = {
        [CODE.EMPTY]: false,
        [CODE.START]: false,
        [CODE.V1]: false,
        [CODE.V2]: false,
        [CODE.VL1]: false,
        [CODE.VL2]: false,
        [CODE.VL3]: false,
        [CODE.H1]: true,
        [CODE.H2]: true,
        [CODE.HL1]: false,
        [CODE.HL2]: false,
        [CODE.HL3]: false
    }

    return (code) => {
        return code_redable_map[code]
    }
})()

const code_data = []
for (let code in CODE) {
    code = CODE[code]
    code_data[code] = {
        code_map: code_map[code],
        bar_length: bar_length[code],
        bar_code: bar_code[code],
        facing: code_facing[code],
        direction: code_direction_map(code),
        redable: code_redable_map(code),
        bar_coord: bar_coord_map(code),
        style: code_style_map(code)
    }
}

stringify_and_write_json("code", CODE)
stringify_and_write_json("code_data", code_data, 2)