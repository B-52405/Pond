async function fetch_json(file_name) {
    return await fetch(`./data/${file_name}.json`)
        .then(response => response.json())
}

export {
    fetch_json
}