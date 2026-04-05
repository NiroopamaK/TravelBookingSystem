const agentModel   = require('../models/agentModel');
const packageModel = require('../models/packageModel');
const bookingModel = require('../models/bookingModel');

// ================= PACKAGES =================
const getAllPackages = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const page   = Math.max(1, parseInt(req.query.page)  || 1);
        const limit  = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const total = await packageModel.countPackagesByAgent(userId);
        const rows  = await packageModel.findPackagesByAgent(userId, limit, offset);

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('getAllPackages error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getPackageById = async (req, res) => {
    try {
        const pkg = await packageModel.findPackageById(req.params.id);
        if (!pkg) return res.status(404).json({ message: 'Package not found' });

        const itinerary_items = await packageModel.findItineraryByPackageId(req.params.id);

        res.json({ ...pkg, itinerary_items });
    } catch (error) {
        console.error('getPackageById error:', error);
        res.status(500).json({ message: error.message });
    }
};

const createPackage = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { title, destination, start_date, end_date, description, created_on, price, itinerary_items } = req.body;

        const package_id = await packageModel.insertPackage(userId, title, destination, start_date, end_date, description, created_on, price);

        if (itinerary_items && itinerary_items.length > 0) {
            for (const item of itinerary_items) {
                await packageModel.insertItineraryItem(item.title, item.description, package_id);
            }
        }

        res.status(201).json({ message: 'Package created successfully', package_id });
    } catch (error) {
        console.error('createPackage error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updatePackage = async (req, res) => {
    try {
        const { title, destination, start_date, end_date, description, price, itinerary_items } = req.body;

        await packageModel.updatePackageById(req.params.id, title, destination, start_date, end_date, description, price);
        await packageModel.deleteItineraryByPackageId(req.params.id);

        if (itinerary_items && itinerary_items.length > 0) {
            for (const item of itinerary_items) {
                await packageModel.insertItineraryItem(item.title, item.description, req.params.id);
            }
        }

        res.json({ message: 'Package updated successfully' });
    } catch (error) {
        console.error('updatePackage error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deletePackage = async (req, res) => {
    try {
        await packageModel.deletePackageById(req.params.id);
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('deletePackage error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= BOOKINGS =================
const getAllBookings = async (req, res) => {
    try {
        const userId          = req.user.user_id;
        const page            = Math.max(1, parseInt(req.query.page)  || 1);
        const limit           = Math.max(1, parseInt(req.query.limit) || 10);
        const offset          = (page - 1) * limit;
        const filterTraveller = req.query.traveller || '';
        const filterPackage   = req.query.package   || '';
        const filterStatus    = req.query.status    || '';

        const total = await bookingModel.countBookingsByAgent(userId, filterTraveller, filterPackage, filterStatus);
        const rows  = await bookingModel.findBookingsByAgent(userId, filterTraveller, filterPackage, filterStatus, limit, offset);

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('getAllBookings error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getTravellerSuggestions = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const names  = await bookingModel.findTravellerSuggestions(userId, req.query.q || '');
        res.json(names);
    } catch (error) {
        console.error('getTravellerSuggestions error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getPackageSuggestions = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const names  = await bookingModel.findPackageSuggestions(userId, req.query.q || '');
        res.json(names);
    } catch (error) {
        console.error('getPackageSuggestions error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const affectedRows = await bookingModel.updateBookingStatusById(req.params.id, status);
        if (affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });

        res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
        console.error('updateBookingStatus error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= DASHBOARD SUMMARY =================
const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const mostUsedPackage = await agentModel.findMostUsedPackage(userId);

        let itinerary_items = [];
        if (mostUsedPackage) {
            itinerary_items = await packageModel.findItineraryByPackageId(mostUsedPackage.package_id);
        }

        const totalRevenue = await agentModel.getTotalRevenue(userId);
        const topTraveller = await agentModel.findTopTraveller(userId);

        res.json({
            mostUsedPackage: mostUsedPackage ? { ...mostUsedPackage, itinerary_items } : null,
            totalRevenue,
            topTraveller
        });
    } catch (error) {
        console.error('getDashboardSummary error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= TRIPS =================
const getTrips = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const page   = Math.max(1, parseInt(req.query.page)  || 1);
        const limit  = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const total = await agentModel.countTripsByAgent(userId);
        const rows  = await agentModel.findTripsByAgent(userId, limit, offset);

        res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('getTrips error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ================= DASHBOARD STATS =================
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const totalPackages      = await agentModel.countTotalPackages(userId);
        const totalTrips         = await agentModel.countTotalTrips(userId);
        const confirmedBookings  = await agentModel.countConfirmedBookings(userId);

        res.json({ totalPackages, totalTrips, confirmedBookings });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    getAllBookings,
    getTravellerSuggestions,
    getPackageSuggestions,
    updateBookingStatus,
    getTrips,
    getDashboardStats,
    getDashboardSummary,
};
