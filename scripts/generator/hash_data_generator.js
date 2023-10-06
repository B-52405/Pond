const { read_json, stringify_and_write_json } = require("../util/json_util_commonjs.js")
const width = 6

const CODE = read_json("code")
const code_data = read_json("code_data")
const code_map = []
for (let code in CODE) {
    code = CODE[code]
    code_map[code] = code_data[code].code_map
}

let line_hash_setter_data = []
for (let j = 0; j < width; j++) {
    line_hash_setter_data[j] = []
    for (let code1 in CODE) {
        code1 = CODE[code1]
        let hash1 = code_map[code1]
        line_hash_setter_data[j][hash1] = []
        for (let code2 in CODE) {
            code2 = CODE[code2]

            let hash2 = code_map[code2]
            line_hash_setter_data[j][hash1][hash2] = (hash1 ^ hash2) << ((width - j - 1) * 2)
        }
    }
}

stringify_and_write_json("line_hash_setter_data", line_hash_setter_data)

