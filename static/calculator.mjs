import { fetch_json } from "../util/json_util_es6.mjs"
import { CODE, code_data } from './code.mjs'

const height = 6, width = 6
const red_line = 2
const code_map = []
const red_end = CODE.H2
for (let code in CODE) {
    code_map[CODE[code]] = code_data[CODE[code]].code_map
}

const yx_code_checker = await fetch_json("yx_code_checker_data")
const yx_code_setter = await fetch_json("yx_code_setter_data")

function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function pond_encode(pond) {
    let pond_code = ""
    for (let i = 0; i < height; i++) {
        let code_line = 0
        for (let j = 0; j < width; j++) {
            code_line = (code_line << 2) + code_map[pond[i][j]]
        }
        pond_code += String.fromCharCode(code_line)
    }
    return pond_code
}

function* next_states(state) {
    let pond = state[0]
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let code = pond[i][j]
            let code_checker = yx_code_checker[i][j][code]
            let code_setter = yx_code_setter[i][j][code]
            if (code_checker.length == 0) {
                continue
            }

            for (let move = 0; move < code_checker.length; move++) {
                if (pond[code_checker[move][0]][code_checker[move][1]] == 0) {
                    let new_pond = deepcopy(pond)
                    let new_step = deepcopy(state[1])

                    for (let k = code_setter[move].length - 1; k >= 0; k--) {
                        new_pond[code_setter[move][k][0]][code_setter[move][k][1]] = code_setter[move][k][2]
                    }
                    new_step.push([i, j, move + 1])
                    yield [new_pond, new_step]
                } else {
                    break
                }
            }
        }
    }
}

function check_win(pond) {
    for (let j = width - 1; j > 0; j--) {
        if (pond[red_line][j] > 0) {
            if (pond[red_line][j] == red_end) {
                return [red_line, j, width - j - 1]
            } else {
                return false
            }
        }
    }
}

function solve_pond(pond) {
    if (pond[red_line][width - 1] == red_end) {
        return []
    }
    let win_move = check_win(pond)
    if (win_move) {
        return [win_move]
    }

    let pond_state_array = [[pond, []]]
    let pond_set = new Set(pond_encode(pond))
    let pond_set_size = 1

    while (true) {
        let temp_state_array = []
        for (let i = pond_state_array.length - 1; i >= 0; i--) {
            let new_states = next_states(pond_state_array[i])
            while (true) {
                let { value: new_state, done: done } = new_states.next()
                if (done) {
                    break
                }
                let stata_code = pond_encode(new_state[0])
                pond_set.add(stata_code)
                if (pond_set.size > pond_set_size) {
                    win_move = check_win(new_state[0])
                    if (win_move) {
                        new_state[1].push(win_move)
                        return new_state[1]
                    }
                    temp_state_array.push(new_state)
                    pond_set_size++
                }
            }
        }

        if (temp_state_array.length == 0) {
            return false
        }
        pond_state_array = temp_state_array
    }
}

export {
    height,
    width,
    red_line,
    deepcopy,
    solve_pond
}