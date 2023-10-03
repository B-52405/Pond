const fs = require('fs')

let stringify = (() => {
    const placeholder = "_placeholder_"

    let pre_process = (obj, collapse) => {
        let deepth = 0
        if (obj instanceof Array || obj instanceof Object) {
            deepth = 1
            for (let i in obj) {
                let [item, item_deepth] = pre_process(obj[i], collapse)
                obj[i] = item
                deepth = Math.max(deepth, item_deepth + 1)
            }
        }
        if (deepth >= 1 && deepth <= collapse && obj instanceof Array) {
            obj = placeholder + JSON.stringify(obj) + placeholder
        }
        return [obj, deepth]
    }

    const replace_map = {
        "[": new RegExp(`(\\\\)*"${placeholder}\\[`, "g"),
        "]": new RegExp(`\\]${placeholder}(\\\\)*\\\"`, "g")
    }

    const space = 4
    return (data, collapse = 1) => {
        if (collapse > 0) {
            data = pre_process(data, collapse)[0]
        }
        let data_json = JSON.stringify(data, null, space)
        for (let key in replace_map) {
            data_json = data_json.replaceAll(replace_map[key], key)
        }
        return data_json
    }
})()


function write_json(file_name, data_json) {
    let file_path = `./data/${file_name}.json`
    try {
        fs.writeFileSync(file_path, data_json);
        console.log(`saved: ${file_path}`)
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

function read_json(file_name) {
    try {
        const data = fs.readFileSync(`./data/${file_name}.json`, 'utf8');
        return JSON.parse(data)
    } catch (err) {
        console.error(err);
        return false
    }
}

function stringify_and_write_json(file_name, data, collapse = 1) {
    let data_json = stringify(data, collapse)
    return write_json(file_name, data_json)
}


module.exports = {
    stringify,
    write_json,
    read_json,
    stringify_and_write_json
}
