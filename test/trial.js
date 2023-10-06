const { stringify_and_write_json } = require("../scripts/util/json_util_commonjs.js");
const { test } = require("./time_test.js");

const deepcopy=(obj)=> {
    return JSON.parse(JSON.stringify(obj))
}

console.log(JSON.stringify(deepcopy))


