import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js'
import { CODE, code_data } from './code.mjs'
import { height, width, red_line, deepcopy } from "./util/constant.mjs"
import { solve_pond } from './calculator.mjs'

const fast_wait_time = 167
const fast_interval_time = 83
const max_move = Math.max(height, width) - 1

const new_bar_setter_map = (() => {
    let new_bar_setter_map = {
        "[-2,0]": [[2, 0, CODE.VL3], [1, 0, CODE.VL2], [0, 0, CODE.VL1]],
        "[-1,0]": [[1, 0, CODE.V2], [0, 0, CODE.V1]],
        "[1,0]": [[-1, 0, CODE.V1], [0, 0, CODE.V2]],
        "[2,0]": [[-2, 0, CODE.VL1], [-1, 0, CODE.VL2], [0, 0, CODE.VL3]],
        "[0,-2]": [[0, 2, CODE.HL3], [0, 1, CODE.HL2], [0, 0, CODE.HL1]],
        "[0,-1]": [[0, 1, CODE.H2], [0, 0, CODE.H1]],
        "[0,1]": [[0, -1, CODE.H1], [0, 0, CODE.H2]],
        "[0,2]": [[0, -2, CODE.HL1], [0, -1, CODE.HL2], [0, 0, CODE.HL3]]
    }
    return (cell, dy, dx) => {
        let new_bar_setter = []
        for (let setter of new_bar_setter_map[`[${dy},${dx}]`]) {
            new_bar_setter.push({
                y: cell.y + setter[0],
                x: cell.x + setter[1],
                code: setter[2]
            })
        }
        return new_bar_setter
    }
})()

function bar_coord_setter_map(cell) {
    let bar_setter = []
    for (let setter of code_data[cell.code].bar_coord) {
        bar_setter.push({
            y: cell.y + setter[0],
            x: cell.x + setter[1]
        })
    }
    return bar_setter
}

function check_outside(y, x) {
    return y < 0 || y >= height || x < 0 || x >= width
}

const initial_pond = (() => {
    let initial_pond = []
    for (let i = 0; i < height; i++) {
        let pond_line = []
        for (let j = 0; j < width; j++) {
            pond_line.push({
                y: i,
                x: j,
                code: 0,
            })
        }
        initial_pond.push(pond_line)
    }
    return () => {
        return initial_pond
    }
})()

createApp({
    data() {
        return {
            pond: initial_pond(),
            new_bar: [],
            solution: undefined,
            step_now: -1,
            step_done: [],
            bar_holding: [],
            bar_holding_coord: [],
            bar_holding_destination: [],
            bar_holding_direction: undefined,
            illustration_visibility: "hidden",
            fast_interval: undefined,
            fast_timeout: undefined
        }
    },
    methods: {
        clear_pond() {
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    this.pond[i][j].code = CODE.EMPTY
                }
            }
            this.new_bar = []
            this.solution = undefined
            this.step_now = -1
            this.step_done = []
        },
        cell_on_dblclick(cell) {
            this.solution = undefined
            let bar_setter = bar_coord_setter_map(cell)
            for (let setter of bar_setter) {
                this.pond[setter.y][setter.x].code = CODE.EMPTY
            }
        },
        release_bar() {
            this.bar_holding = []
            this.bar_holding_coord = []
            this.bar_holding_destination = []
            this.bar_holding_direction = undefined
        },
        hold_bar(cell) {
            this.release_bar()
            this.bar_holding_coord = code_data[cell.code].bar_coord
            for (let coord of this.bar_holding_coord) {
                this.bar_holding.push(this.pond[cell.y + coord[0]][cell.x + coord[1]])
            }
            this.bar_holding_direction = code_data[cell.code].direction
            let orientation_checked = {
                "1": false,
                "-1": false
            }
            for (let move = 1; move < max_move; move++) {
                if (orientation_checked[1] && orientation_checked[-1]) {
                    break
                }
                for (let i in orientation_checked) {
                    if (!orientation_checked[i]) {
                        let y = cell.y + this.bar_holding_direction.y * move * i
                        let x = cell.x + this.bar_holding_direction.x * move * i
                        if (this.check_moveable(y, x)) {
                            this.bar_holding_destination.push(this.pond[y][x])
                        } else {
                            orientation_checked[i] = true
                        }
                    }
                }
            }
        },
        check_moveable(y, x) {
            for (let coord of this.bar_holding_coord) {
                let y1 = y + coord[0]
                let x1 = x + coord[1]
                if (check_outside(y1, x1)
                    || !this.bar_holding.includes(this.pond[y1][x1])
                    && this.pond[y1][x1].code != CODE.EMPTY) {
                    return false
                }
            }
            return true
        },
        table_on_mouse_leave() {
            this.release_bar()
        },
        cell_on_mouse_down(cell) {
            if (this.new_bar.length > 0) {
                this.cell_on_mouse_up(cell)
            }

            this.solution = undefined
            if (cell.code == CODE.EMPTY) {
                cell.code = CODE.START
                this.new_bar = [cell]
                return
            }

            this.hold_bar(cell)
        },
        cell_on_mouse_up(cell) {
            if (this.new_bar.length > 0) {
                if (this.new_bar[0].code == CODE.START) {
                    this.new_bar[0].code = CODE.EMPTY
                }
                this.new_bar = []
            }
            if (this.bar_holding.length > 0) {
                this.release_bar()
            }
        },
        cell_on_mouse_enter(cell) {
            if (this.bar_holding.length > 0) {
                for (let cell_holding of this.bar_holding_destination) {
                    if (this.bar_holding_direction.y * cell.y == this.bar_holding_direction.y * cell_holding.y
                        && this.bar_holding_direction.x * cell.x == this.bar_holding_direction.x * cell_holding.x) {
                        let cell_code_list = []
                        for (let bar_cell of this.bar_holding) {
                            cell_code_list.push(bar_cell.code)
                            bar_cell.code = CODE.EMPTY
                        }
                        for (let coord of this.bar_holding_coord) {
                            this.pond[cell_holding.y + coord[0]][cell_holding.x + coord[1]].code
                                = cell_code_list.shift()
                        }
                        this.hold_bar(cell_holding)
                        break
                    }
                }
                return
            }
            if (this.new_bar.length == 0) {
                return
            }
            let dy = cell.y - this.new_bar[0].y
            let dx = cell.x - this.new_bar[0].x
            if (cell.code != CODE.EMPTY || dy != 0 && dx != 0 || Math.abs(dy + dx) > 2) {
                return
            }
            let setter_list = new_bar_setter_map(cell, dy, dx)
            if (setter_list.length == 3 && this.pond[setter_list[1].y][setter_list[1].x].code != CODE.EMPTY) {
                return
            }
            this.new_bar = []
            for (let setter of setter_list) {
                this.pond[setter.y][setter.x].code = setter.code
                this.new_bar.push(this.pond[setter.y][setter.x])
            }
        },
        cell_on_mouse_leave(cell) {
            if (this.new_bar.length == 0) {
                return
            }
            this.new_bar[0].code = CODE.START
            for (let i = 1; i < this.new_bar.length; i++) {
                this.new_bar[i].code = CODE.EMPTY
            }
            this.new_bar = [this.new_bar[0]]
        },
        bar_div_style(cell) {
            let style = deepcopy(code_data[cell.code].style)
            if (cell.y == red_line && code_data[cell.code].redable) {
                style['background-color'] = "#EE5746"
            }
            if (this.bar_holding.includes(cell)) {
                style['box-shadow'] = "1px 2px 6px 2px rgba(0, 0, 0, 0.3)"
            }
            return style
        },
        get_pond_state() {
            let pond_state = []
            for (let i = 0; i < height; i++) {
                let pond_line = []
                for (let j = 0; j < width; j++) {
                    pond_line.push(this.pond[i][j].code)
                }
                pond_state.push(pond_line)
            }
            return pond_state
        },
        calculate_pond() {
            let pond_state = this.get_pond_state()

            let start_time = new Date().getTime()
            this.solution = solve_pond(pond_state)
            console.log(`pond solved. time: ${new Date().getTime() - start_time}`)
            this.step_now = -1
            this.step_done = []
        },
        previous_step() {
            if (!this.solution || this.step_done.length == 0) {
                return
            }
            this.step_now--
            let step_change = this.step_done.pop()
            for (let change of step_change) {
                this.pond[change.y0][change.x0].code = change.code
                this.pond[change.y1][change.x1].code = CODE.EMPTY
            }
        },
        next_step() {
            if (!this.solution || this.step_now == this.solution.length - 1) {
                return
            }
            this.step_now++
            let step = this.solution[this.step_now]
            let cell = this.pond[step[0]][step[1]]
            let bar_setter = bar_coord_setter_map(cell)
            let facing = code_data[cell.code].facing
            let step_change = []
            for (let setter of bar_setter) {
                let y1 = setter.y + facing[0] * step[2]
                let x1 = setter.x + facing[1] * step[2]
                this.pond[y1][x1].code = this.pond[setter.y][setter.x].code
                this.pond[setter.y][setter.x].code = CODE.EMPTY

                step_change.unshift({
                    y0: setter.y,
                    x0: setter.x,
                    y1: y1,
                    x1: x1,
                    code: this.pond[y1][x1].code
                })
            }
            this.step_done.push(step_change)
        },
        step_on_mouse_down(handler) {
            this.fast_timeout = setTimeout(() => {
                this.fast_start(handler)
            }, fast_wait_time)
        },
        step_on_mouse_up(handler) {
            if (this.fast_interval == undefined) {
                handler()
            }
            this.fast_stop()
        },
        fast_start(handler) {
            this.fast_interval = setInterval(handler, fast_interval_time)
        },
        fast_stop() {
            if (this.fast_interval != undefined) {
                clearInterval(this.fast_interval)
            }
            if (this.fast_timeout != undefined) {
                clearTimeout(this.fast_timeout)
            }
            this.fast_interval = undefined
            this.fast_timeout = undefined
        },
        show_illustration(visibility) {
            this.illustration_visibility = visibility ? "visible" : "hidden"
        }
    },
    computed: {
        step_prompt() {
            if (this.solution == undefined) {
                return "--"
            }
            if (this.solution === false) {
                return "无解"
            }
            return `${this.step_now + 1}/${this.solution.length}`
        }
    },
    mounted() {
        window.solve_pond_test = (round = 5) => {
            console.log(`start. round: ${round}`)

            let pond = this.get_pond_state()

            let start_time = new Date().getTime()
            let average_time = 0
            for (let i = 0; i < round; i++) {
                solve_pond(pond)
                let end_time = new Date().getTime()
                let cost_time = end_time - start_time
                console.log(`round: ${i + 1}; time: ${cost_time}ms`)
                average_time += cost_time
                start_time = end_time
            }
            average_time /= round
            return `finished. average time: ${average_time}ms`
        }
        window.print_pond = () => {
            let pond = []
            for (let i = 0; i < height; i++) {
                pond[i] = []
                for (let j = 0; j < width; j++) {
                    pond[i][j] = this.pond[i][j].code
                }
            }
            return JSON.stringify(pond)
        }
        window.copy_pond = (pond) => {
            pond = JSON.parse(pond)
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    this.pond[i][j].code = pond[i][j]
                }
            }
        }
    }
}).mount('#app')

document.getElementById("body").style.visibility = "visible"
document.ondragstart = function () { return false }