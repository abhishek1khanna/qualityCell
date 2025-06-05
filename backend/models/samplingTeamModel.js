import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const sampleTeamSchema = new mongoose.Schema({
    di: String,
    memberName: String, mobileNo: String, role: String,email:String,
    sapID:String,location:String,uID:String,loginPersonName:String,
    otp: {
        token: {
            type: String,
        },
        expiry_time: {
            type: String,
        }
        }
}, {
    timestamps: true
});

sampleTeamSchema.plugin(mongoosePaginate);


export default mongoose.model('sampleteams', sampleTeamSchema);
