const {getPackages} = require('../models/packageModel')
async function explore(req, res) {
    const data = await getPackages()
    const packages = data.map(package => {
        const monthNameStart = package.start_date.toLocaleString('en-US', { month: 'long' })
        const monthNameEnd = package.start_date.toLocaleString('en-US', { month: 'long' })
        package.start_date = `${monthNameStart} ${package.start_date.getDate()}`
        package.end_date = `${monthNameEnd} ${package.end_date.getDate()} ${package.end_date.getFullYear()}`
        return package 
    })
    res.render('traveller/traveller_explore', {packages})
}

function dashboard(req, res) {
    res.render('traveller/traveller_dashboard')
}

module.exports = {explore, dashboard}