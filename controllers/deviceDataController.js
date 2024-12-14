import mongoose from 'mongoose';
import DeviceData from '../models/deviceDataModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all data for a specific device by ID
const getDeviceData = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    
    const deviceData = await DeviceData.find({ device: deviceId })
        .sort({ createdAt: -1 })
        .populate('device', 'deviceName');

    if (!deviceData.length) {
        res.status(404);
        throw new Error('No data found for this device');
    }

    res.status(200).json(deviceData);
});

const getDeviceAnalytics = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { duration = '24h' } = req.query;

    // Calculate the start time based on duration
    const startTime = new Date();
    switch (duration) {
        case '24h':
            startTime.setHours(startTime.getHours() - 24);
            break;
        case '7d':
            startTime.setDate(startTime.getDate() - 7);
            break;
        default:
            startTime.setHours(startTime.getHours() - 24);
    }

    // Get summary statistics
    const summary = await DeviceData.aggregate([
        {
            $match: {
                device: new mongoose.Types.ObjectId(deviceId),
                createdAt: { $gte: startTime }
            }
        },
        {
            $group: {
                _id: null,
                avgTemperature: { $avg: '$temperature' },
                avgHumidity: { $avg: '$humidity' },
                maxTemperature: { $max: '$temperature' },
                minTemperature: { $min: '$temperature' },
                maxHumidity: { $max: '$humidity' },
                minHumidity: { $min: '$humidity' }
            }
        }
    ]);

    res.status(200).json({
        summary: summary[0] || null
    });
});

const getDeviceTrends = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { limit = 24 } = req.query;

    const trends = await DeviceData.find({ device: deviceId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('temperature humidity createdAt -_id')
        .lean();

    // Reverse the array to get chronological order
    const chronologicalTrends = trends.reverse();

    res.status(200).json(chronologicalTrends);
});

const getDeviceBatchData = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { limit = 24 } = req.query;

    const batchData = await DeviceData.find({ device: deviceId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('temperature humidity createdAt')
        .lean();

    if (!batchData.length) {
        res.status(404);
        throw new Error('No data found for this device');
    }

    res.status(200).json(batchData);
});

const getGraphData = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { duration = '24h', points = 24 } = req.query;

    // Validate duration
    const validDurations = ['1h', '24h', '7d', '30d'];
    if (!validDurations.includes(duration)) {
        res.status(400);
        throw new Error('Invalid duration parameter');
    }

    // Calculate time range
    const end = new Date();
    const start = new Date();
    switch (duration) {
        case '1h': start.setHours(end.getHours() - 1); break;
        case '24h': start.setHours(end.getHours() - 24); break;
        case '7d': start.setDate(end.getDate() - 7); break;
        case '30d': start.setDate(end.getDate() - 30); break;
    }

    // Calculate interval in milliseconds for grouping
    const timeRange = end - start;
    const intervalMs = Math.floor(timeRange / points);

    const data = await DeviceData.aggregate([
        {
            $match: {
                device: new mongoose.Types.ObjectId(deviceId),
                createdAt: { $gte: start, $lte: end }
            }
        },
        {
            $sort: { createdAt: 1 }
        },
        {
            $group: {
                _id: {
                    $floor: {
                        $divide: [
                            { $subtract: ['$createdAt', start] },
                            intervalMs
                        ]
                    }
                },
                timestamp: { $first: '$createdAt' },
                temperature: { $avg: '$temperature' },
                humidity: { $avg: '$humidity' }
            }
        },
        {
            $project: {
                _id: 0,
                timestamp: 1,
                temperature: { $round: ['$temperature', 1] },
                humidity: { $round: ['$humidity', 1] }
            }
        },
        {
            $sort: { timestamp: 1 }
        }
    ]);

    const response = {
        data,
        metadata: {
            start,
            end,
            pointCount: data.length,
            deviceId,
            requestedPoints: parseInt(points),
            duration
        }
    };

    if (!data.length) {
        res.status(404);
        throw new Error('No data found for this time range');
    }

    res.status(200).json(response);
});

const getTimeSeriesData = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { limit = 24, format = 'simple' } = req.query;

    const data = await DeviceData.find({ device: deviceId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('temperature humidity createdAt')
        .lean();

    if (!data.length) {
        res.status(404);
        throw new Error('No data found for this device');
    }

    // Process data for plotting
    const processedData = data.reverse().map(reading => ({
        timestamp: reading.createdAt,
        readableTime: new Date(reading.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        temperature: Number(reading.temperature.toFixed(1)),
        humidity: Number(reading.humidity.toFixed(1))
    }));

    // Calculate statistics
    const stats = {
        avgTemperature: Number((processedData.reduce((acc, curr) => acc + curr.temperature, 0) / processedData.length).toFixed(1)),
        avgHumidity: Number((processedData.reduce((acc, curr) => acc + curr.humidity, 0) / processedData.length).toFixed(1)),
        minTemperature: Math.min(...processedData.map(d => d.temperature)),
        maxTemperature: Math.max(...processedData.map(d => d.temperature)),
        minHumidity: Math.min(...processedData.map(d => d.humidity)),
        maxHumidity: Math.max(...processedData.map(d => d.humidity)),
    };

    // Format response based on query parameter
    const response = format === 'chart' ? {
        labels: processedData.map(d => d.readableTime),
        datasets: {
            temperature: processedData.map(d => d.temperature),
            humidity: processedData.map(d => d.humidity)
        },
        statistics: stats
    } : {
        data: processedData,
        statistics: stats
    };

    res.status(200).json(response);
});

export {
    getDeviceData,
    getDeviceAnalytics,
    getDeviceTrends,
    getDeviceBatchData,
    getGraphData,
    getTimeSeriesData
};
