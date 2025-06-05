import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const sempleSchema = new mongoose.Schema({
    di: String,
    samplingGroupID: String,
    canDispatch:Number,
    sealingDate: { type: Date },
    sealDetails: String,
    sealDone:{
        type: Number, default: 0
    },
    teamMembers:[{
        memberName: String,
        mobileNo: String,
        role: String,
        email: String,
    }], 
    items:[{
        testToPerform: [String],
        inLabs: [String],
        Line_NO: String,
        materialName: String,
        grnNo: String,
        itemID: String,
        finalSample:{
            type: Number,
            default: 0
        },
        additionalTestRequired: String,
        testName: String,
        location: String,
        discom:String,
        uID:String
    }],
    additionalTestRequired:String,
    additionalTestName: String,
    uniqueSampleNo: String,

    communicateStoreCenterSampleDetails:{
        type: Number, default: 1
    },
    requestTocommunicate:{
        type: Number, default: 0
    },
    associatedTags:String,
    sapID:String,location:String,uID:String,loginPersonName:String
}, {
    timestamps: true
});



sempleSchema.plugin(mongoosePaginate);


export default mongoose.model('samples', sempleSchema);
