import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const preSampleSchema = new mongoose.Schema({
    di: String,
    grnSelected: [{
        id: String,
    }],
    noOfSamples: Number,
    sampleSelectionDone:{
        type: Number, default: 0
    },
    sealingDate: { type: Date },
    sealDetails: String,
    associatedTags:String,
    sapID:String,location:String,uID:String,loginPersonName:String,discom:String
}, {
    timestamps: true
});

preSampleSchema.plugin(mongoosePaginate);


export default mongoose.model('presamples', preSampleSchema);
