import DeviceData from '../models/deviceDataModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all data for a specific device by ID
const getDeviceData = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    
    const deviceData = await DeviceData.find({ _id: deviceId })
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
