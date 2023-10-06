function test(executor, round = 5, round_time_visible = true) {
    let start_time = new Date().getTime()
    let average_time = 0
    for (let i = 0; i < round; i++) {
        executor()
        let end_time = new Date().getTime()
        let cost_time = end_time - start_time
        if(round_time_visible){
            console.log(`round: ${i + 1}; time: ${cost_time}ms`)
        }
        average_time += cost_time
        start_time = end_time
    }
    average_time /= round
    console.log(`finished. average time: ${average_time}ms`)
    return average_time
}

module.exports = {
    test
}