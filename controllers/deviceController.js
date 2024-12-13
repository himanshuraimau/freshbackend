import Device from '../models/deviceModel.js';
import DeviceData from '../models/deviceDataModel.js';

// Add a device to user's account
export const addDevice = async (req, res) => {
    try {
        const { deviceName, password } = req.body;
        const userId = req.user._id; // Assuming you have user authentication middleware

        // Check if device exists in database with correct credentials
        const device = await Device.findOne({ 
            deviceName, 
            password 
        });

        if (!device) {
            return res.status(404).json({ 
                message: "Device not found or incorrect credentials" 
            });
        }

        // Check if device is already linked to any user
        if (device.user) {
            return res.status(400).json({ 
                message: "Device is already registered to another user" 
            });
        }

        // Link device to user
        device.user = userId;
        await device.save();

        res.status(200).json({
            message: "Device linked successfully",
            device: {
                id: device._id,
                deviceName: device.deviceName
            }
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Error linking device", 
            error: error.message 
        });
    }
};

// Get all devices for a user
export const getUserDevices = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have user authentication middleware
        
        const devices = await Device.find({ user: userId })
            .select('deviceName _id createdAt');

        res.status(200).json({ devices });

    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching devices", 
            error: error.message 
        });
    }
};

// Get device status and latest data
export const getDeviceStatus = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const userId = req.user._id;

        const device = await Device.findOne({
            _id: deviceId,
            user: userId
        });

        if (!device) {
            return res.status(404).json({
                message: "Device not found or unauthorized"
            });
        }

        const latestData = await DeviceData.findOne({ device: deviceId })
            .sort({ createdAt: -1 });

        // Update device status based on last active time
        const now = new Date();
        const lastActiveTime = latestData ? latestData.createdAt : device.lastActive;
        const hoursSinceLastActive = (now - lastActiveTime) / (1000 * 60 * 60);

        if (hoursSinceLastActive > 24) {
            device.status = 'inactive';
            await device.save();
        }

        res.status(200).json({
            device: {
                id: device._id,
                deviceName: device.deviceName,
                status: device.status,
                lastActive: lastActiveTime
            },
            latestData
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching device status",
            error: error.message
        });
    }
};

// Delete a device
export const deleteDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const userId = req.user._id; // Assuming you have user authentication middleware

        // Check if device exists and belongs to user
        const device = await Device.findOne({
            _id: deviceId,
            user: userId
        });

        if (!device) {
            return res.status(404).json({ 
                message: "Device not found or unauthorized" 
            });
        }

        await Device.findByIdAndDelete(deviceId);

        res.status(200).json({ 
            message: "Device deleted successfully" 
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Error deleting device", 
            error: error.message 
        });
    }
};
