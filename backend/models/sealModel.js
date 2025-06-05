import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const sealSchema = new mongoose.Schema({
    di: String,
    sealNo:String,
    sealingDate: { type: Date },
    actualSealingDate: { type: Date },
    sealDetails: String,
    canDispatch:{
        type: Number,
        default: 1
    },
    samplesSelected: [{
        testToPerform: [String],
        inLabs: [String],
        Line_NO: String,
        materialName: String,
        grnNo: String,
        itemID: String,
        additionalTestRequired: String,
        testName: String,
        location: String,
        testResult: String,
        description: String,
        labName : String,
        finalSample:Number,
        sendForFinalDispatch:{
            type: Number,
            default: 0
        },
        uID : String,
    }],
    teamMembersSelected:[{
        memberName: String,
        mobileNo: String,
        role: String,
        email: String,
    }],
    photographs: [String],
    video: [String],
    paymentTypes: String,
    feesPayment: [{
        billDate: { type: Date },
        billAmount: { type: Number },
        billID: { type: String },
        notes: String,
        sapID:String,uID:String,loginPersonName:String
    }],
    itemsSent: [{
        testToPerform:[String],
        inLabs:[String],
        Line_NO: String,
        materialName:String,
        grnNo: String,
        itemID: String,
        location: String,
        dateOfTransaction: { type: Date },
        details: { type: String },
        labName: { type: String },
        VehicleNo: String,
        additionalTestRequired: String,
        testName: String,
        finalSample:Number,
        sapID:String,uID:String,loginPersonName:String
    }],
    itemsReceive: [{
        testToPerform:[String],
        inLabs:[String],
        Line_NO: String,
        materialName:String,
        grnNo: String,
        itemID: String,
        location: String,
        additionalTestRequired: String,
        testName: String,
        finalSample:Number,
        dateOfTransaction: { type: Date },
        details: { type: String },
        labName: { type: String },
        sapID:String,uID:String,loginPersonName:String
    }],
    testResults: [{
        testName: { type: String },
        result: { type: String },
        testDate: { type: Date },
        notes: { type: String },
        labName: { type: String },
        sapID:String,uID:String,loginPersonName:String
    }],
    associatedTags:String,
    sapID:String,location:String,uID:String,loginPersonName:String,discom:String
}, {
    timestamps: true
});

sealSchema.plugin(mongoosePaginate);


export default mongoose.model('seals', sealSchema);
