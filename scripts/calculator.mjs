import { fetch_json } from "./util/json_util_es6.mjs"
import { CODE, code_data } from './code.mjs'
import { height, width, red_line } from "./util/constant.mjs"

const red_end = CODE.H2
const code_map = []
for (let code in CODE) {
    code = CODE[code]
    code_map[code] = code_data[code].code_map
}

const yx_code_checker = await fetch_json("yx_code_checker_data")
const yx_code_setter = await fetch_json("yx_code_setter_data")
const yx_code_line_index = await fetch_json("yx_code_line_index_data")
const line_hash_setter = await fetch_json("line_hash_setter_data")

let pond_state_array = []
let pond_set = new Set()
let pond_set_size = 0

function pond_hash(pond, pond_hash_pre, setter) {
    for (let i = setter.length - 1; i >= 0; i--) {
        let [y, x, code2] = setter[i]
        let code1 = pond[y][x]
        let hash_setter = line_hash_setter[x][code_map[code1]][code_map[code2]]
        pond_hash_pre[y] ^= hash_setter
    }
    let pond_hash_code = ""
    for (let i = 0; i < height; i++) {
        pond_hash_code += String.fromCharCode(pond_hash_pre[i])
    }
    return pond_hash_code
}

function* next_states(state) {
    let [pond, step, pond_hash_pre] = state
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let code = pond[i][j]
            if (code == 0) {
                continue
            }

            let code_checker = yx_code_checker[i][j][code]
            let code_setter = yx_code_setter[i][j][code]
            let code_line_index = yx_code_line_index[i][j][code]
            for (let move = 0; move < code_checker.length; move++) {
                if (pond[code_checker[move][0]][code_checker[move][1]] == 0) {
                    let new_pond_hash_pre = [
                        pond_hash_pre[0], pond_hash_pre[1], pond_hash_pre[2],
                        pond_hash_pre[3], pond_hash_pre[4], pond_hash_pre[5]
                    ]
                    let pond_hash_code = pond_hash(pond, new_pond_hash_pre, code_setter[move])
                    pond_set.add(pond_hash_code)
                    if (pond_set.size == pond_set_size) {
                        continue
                    }
                    pond_set_size++

                    let new_pond = [pond[0], pond[1], pond[2], pond[3], pond[4], pond[5]]
                    for (let k = code_line_index[move].length - 1; k >= 0; k--) {
                        let y = code_line_index[move][k]
                        new_pond[y] = [
                            new_pond[y][0], new_pond[y][1], new_pond[y][2],
                            new_pond[y][3], new_pond[y][4], new_pond[y][5]
                        ]
                    }
                    for (let k = code_setter[move].length - 1; k >= 0; k--) {
                        let [y, x] = [code_setter[move][k][0], code_setter[move][k][1]]
                        new_pond[y][x] = code_setter[move][k][2]
                    }
                    yield [new_pond, [step, [i, j, move + 1]], new_pond_hash_pre]
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

function step_to_solution(step) {
    let solution = []
    while (step.length == 2) {
        solution.unshift(step[1])
        step = step[0]
    }
    return solution
}

function solve_pond(pond) {
    if (pond[red_line][width - 1] == red_end) {
        return []
    }
    let win_move = check_win(pond)
    if (win_move) {
        return [win_move]
    }

    let pond_hash_pre = []
    for (let i = 0; i < height; i++) {
        let hash_line = 0
        for (let j = 0; j < width; j++) {
            hash_line = (hash_line << 2) + code_map[pond[i][j]]
        }
        pond_hash_pre[i] = hash_line
    }
    pond_state_array = [[pond, [], pond_hash_pre]]
    pond_set = new Set(pond_hash(pond, pond_hash_pre, []))
    pond_set_size = 1

    while (true) {
        let temp_state_array = []
        for (let i = pond_state_array.length - 1; i >= 0; i--) {
            let new_states = next_states(pond_state_array[i])
            while (true) {
                let { value: new_state, done: done } = new_states.next()
                if (done) {
                    break
                }
                let [pond, step] = new_state
                win_move = check_win(pond)
                if (win_move) {
                    return step_to_solution([step, win_move])
                }
                temp_state_array.push(new_state)
            }
        }

        if (temp_state_array.length == 0) {
            return false
        }
        pond_state_array = temp_state_array
    }
}

export {
    solve_pond
}