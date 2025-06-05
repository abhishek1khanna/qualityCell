import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const testMasterSchema = new mongoose.Schema({
    testName: { type: String, required: true, unique: true },
    testDescription: { type: String, required: true },
    categoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    sapID:String,location:String,uID:String,loginPersonName:String
}, {
    timestamps: true
});

testMasterSchema.plugin(mongoosePaginate);


export default mongoose.model('testmasters', testMasterSchema);
