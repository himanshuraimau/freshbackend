import DeviceData from '../models/deviceDataModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all data for a specific device by ID or name
const getDeviceData = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    
    // Search by either device ID or device name
    const query = isNaN(deviceId) 
        ? { 'device.deviceName': deviceId }
        : { device: deviceId };

    const deviceData = await DeviceData.find(query)
        .sort({ createdAt: -1 })
        .populate('device', 'deviceName');

    if (!deviceData.length) {
        res.status(404);
        throw new Error('No data found for this device');
    }

    res.status(200).json(deviceData);
});

export {
    getDeviceData
};
