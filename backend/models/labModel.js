import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const labSchema = new mongoose.Schema({
    labName: { type: String, required: true, unique: true },
    labLocation: { type: String, required: true },
    sapID:String,location:String,uID:String,loginPersonName:String
}, {
    timestamps: true
});

labSchema.plugin(mongoosePaginate);


export default mongoose.model('labs', labSchema);
