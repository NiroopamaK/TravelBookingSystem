const express = require('express');
const router = express.Router();
const package_controller = require('../controllers/package_controller');

router.get('/', package_controller.get_all_packages);
router.get('/:id', package_controller.get_package_by_id);
router.post('/', package_controller.create_package);
router.put('/:id', package_controller.update_package);
router.delete('/:id', package_controller.delete_package);

module.exports = router;