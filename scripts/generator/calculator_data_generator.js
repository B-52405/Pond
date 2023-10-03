const { read_json, stringify_and_write_json } = require("../../util/json_util_commonjs.js")

const height = 6, width = 6
const max_move = Math.max(height, width) - 1

function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

const CODE = read_json("code")
const code_data = read_json("code_data")

const empty_map = (() => {
    let empty_code_map = []
    for (let i in CODE) {
        empty_code_map.push(undefined)
    }
    let empty_line_map = []
    for (let j = 0; j < width; j++) {
        empty_line_map.push(empty_code_map)
    }
    let empty_yx_code_map = []
    for (let i = 0; i < height; i++) {
        empty_yx_code_map.push(empty_line_map)
    }
    return () => {
        return deepcopy(empty_yx_code_map)
    }
})()

let yx_code_checker_map = empty_map()
let yx_code_setter_map = empty_map()

let code_count = Object.keys(CODE).length
for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
        let code_checker_map = []
        let code_setter_map = []
        for (let code = 0; code < code_count; code++) {
            let checker = []
            let setter = []

            let facing = code_data[code].facing
            if (facing != undefined) {
                let bar_coord = code_data[code].bar_coord
                let bar_code = code_data[code].bar_code
                let bar_length = code_data[code].bar_length

                for (let move = 1; move <= max_move; move++) {
                    let y = i + move * facing[0]
                    let x = j + move * facing[1]
                    if (y < 0 || y >= height || x < 0 || x >= width) {
                        break
                    }
                    let move_setter = []
                    for (let k = 0; k < bar_length; k++) {
                        move_setter.push([y + bar_coord[k][0], x + bar_coord[k][1], bar_code[k]])
                    }
                    for (let k = 0; k < bar_length; k++) {
                        let y1 = i + bar_coord[k][0]
                        let x1 = j + bar_coord[k][1]
                        if (move_setter.filter(([y, x, code]) => y == y1 && x == x1).length == 0) {
                            move_setter.push([y1, x1, CODE.EMPTY])
                        }
                    }
                    checker.push([y, x])
                    setter.push(move_setter)
                }
            }
            code_checker_map.push(checker)
            code_setter_map.push(setter)
        }

        code_checker_map.pop()
        code_setter_map.pop()

        yx_code_checker_map[i][j] = code_checker_map
        yx_code_setter_map[i][j] = code_setter_map
    }
}

stringify_and_write_json("yx_code_checker_data", yx_code_checker_map, 2)
stringify_and_write_json("yx_code_setter_data", yx_code_setter_map, 3)
