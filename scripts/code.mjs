import { fetch_json } from "./util/json_util_es6.mjs"

const CODE = await fetch_json("code")

const code_data = await fetch_json("code_data")

export {
    CODE,
    code_data
}
