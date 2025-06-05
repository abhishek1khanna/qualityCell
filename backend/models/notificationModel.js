import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    di:String,
    materialName:String,
    Line_NO:String,
    grnNo:String,
    location:String,
    notificationFor:String,
    markRead:{type:Number,default:0},
    discom:String,
    sapID:String,officelocation:String,uID:String,loginPersonName:String
}, {
    timestamps: true
});

notificationSchema.plugin(mongoosePaginate);


export default mongoose.model('notifications', notificationSchema);
