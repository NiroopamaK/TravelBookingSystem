function explore(req, res) {
    res.send("explore page")
}

function dashboard(req, res) {
    res.send("dashboard page")
}

module.exports = {explore, dashboard}