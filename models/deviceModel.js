import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
    deviceName:{
        type: String,
        required: true,
    },
    devicePassword:{
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

const Device = mongoose.model('Device', deviceSchema);

export default Device;