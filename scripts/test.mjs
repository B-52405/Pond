import { fetch_json } from "./util/json_util_es6.mjs"

const pond_example = await fetch_json("pond_example")

function test(executor, round = 5) {
    console.log(`start. round: ${round}`)
    let start_time = new Date().getTime()
    let average_time = 0
    for (let i = 0; i < round; i++) {
        executor()
        let end_time = new Date().getTime()
        let cost_time = end_time - start_time
        console.log(`round: ${i + 1}; time: ${cost_time}ms`)
        average_time += cost_time
        start_time = end_time
    }
    average_time /= round
    return `finished. average time: ${average_time}ms`
}

export {
    pond_example,
    test
}