const { getPackages, getPackageById, getPackageByIdWithItinerary } = require('../models/packageModel');
const bookingModel = require('../models/bookingModel');

// Format package dates for frontend
function formatPackageDates(pkg) {
  if (!pkg.start_date || !pkg.end_date) return pkg;

  const monthNameStart = pkg.start_date.toLocaleString('en-US', { month: 'long' });
  const monthNameEnd = pkg.end_date.toLocaleString('en-US', { month: 'long' });

  return {
    ...pkg,
    start_date: `${monthNameStart} ${pkg.start_date.getDate()}`,
    end_date: `${monthNameEnd} ${pkg.end_date.getDate()} ${pkg.end_date.getFullYear()}`
  };
}

// ================= PACKAGES =================

// GET /traveller/explore/data
const getPackagesData = async (req, res) => {
  try {
    const userId = req.session.user?.user_id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = await getPackages();
    const packages = data.map(formatPackageDates);

    res.json({ success: true, data: packages });
  } catch (err) {
    console.error('getPackagesData error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /traveller/booking/:packageId/data
const getPackageData = async (req, res) => {
  try {
    const userId = req.session.user?.user_id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { packageId } = req.params;
    const pkg = await getPackageById(packageId);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

    res.json({ success: true, data: formatPackageDates(pkg) });
  } catch (err) {
    console.error('getPackageData error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= BOOKINGS =================

// POST /bookings/createBooking
const createBooking = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const booking = {
      ...req.body,
      user_id: user.user_id,
      status: "PENDING"
    };

    const result = await bookingModel.createBooking(booking);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('createBooking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /bookings/getBookingsByUser
const getAllBookingsByUser = async (req, res) => {
  try {
    const userId = req.session.user?.user_id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const bookings = await bookingModel.getAllBookingsByUser(userId);
    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error('getAllBookingsByUser error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const viewPackageByID = async (req, res) => {
  try {
    const { packageId } = req.params;
    const pkg = await getPackageByIdWithItinerary(packageId);
    const formattedPkg = formatPackageDates(pkg);

    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(formattedPkg);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPackagesData,
  getPackageData,
  createBooking,
  getAllBookingsByUser,
  viewPackageByID
};