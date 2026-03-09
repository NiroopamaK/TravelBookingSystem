const { getPackages, getPackageById } = require('../models/packageModel');

async function explore(req, res) {
  const data = await getPackages();

  const packages = data.map(pkg => {
    const monthNameStart = pkg.start_date.toLocaleString('en-US', { month: 'long' });
    const monthNameEnd = pkg.end_date.toLocaleString('en-US', { month: 'long' });

    pkg.start_date = `${monthNameStart} ${pkg.start_date.getDate()}`;
    pkg.end_date = `${monthNameEnd} ${pkg.end_date.getDate()} ${pkg.end_date.getFullYear()}`;
    return pkg;
  });
    console.log (packages)
  res.render('traveller/traveller_explore', { packages });
}

function dashboard(req, res) {
  res.render('traveller/traveller_dashboard');
}

async function bookingPage(req, res) {
  const { packageId } = req.params;

  const pkg = await getPackageById(packageId);
  if (!pkg) {
    return res.status(404).send("Package not found");
  }

  // Format dates same style as explore
  const monthNameStart = pkg.start_date.toLocaleString('en-US', { month: 'long' });
  const monthNameEnd = pkg.end_date.toLocaleString('en-US', { month: 'long' });
  pkg.start_date = `${monthNameStart} ${pkg.start_date.getDate()}`;
  pkg.end_date = `${monthNameEnd} ${pkg.end_date.getDate()} ${pkg.end_date.getFullYear()}`;

  res.render('traveller/traveller_booking', { pkg });
}

module.exports = { explore, dashboard, bookingPage };