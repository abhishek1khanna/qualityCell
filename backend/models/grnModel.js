import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const grnSchema = new mongoose.Schema({
    // materialID: { type: mongoose.Schema.Types.ObjectId, ref: 'materials' },
    di:String,
    Line_NO: { type: String },
    Contract_No: { type: String },
    totalQuantityLineNo: { type: String },
    materialName: { type: String },
    materialCode: { type: String },
    quantity:Number,
    sampleSelectedFromIt:Number,
    receiveDate: { type: Date },
    receiveMaterialRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "received-materials"
    },
    receiveMaterailList: [{
        Serial_NO:String,
    }],
    customReceivedMaterial:[{
        name:String,
        quantity:String,
    }],
    Mat_Group: { type: String },
    plant: { type: String },
    plantName: { type: String },
    storeLocation: { type: String },
    grnNo: { type: String, required: true },
    year: { type: String },
    Price: { type: String },
    identifyingParticulars: { type: String },
    associatedTests:[String],
    associatedLabs:[String],
    associatedTags:String,
    showToUQC:Number,
    suppliedQtyAgainstPOTillDate: Number,
    remainingQtyToBeDelivered: Number,
    additionalTestRequired: String,
    additionalTestName: String,
    uniqueSampleNo: String,
    discom:String,sapID:String,location:String,uID:String,loginPersonName:String
}, {
    timestamps: true
});

grnSchema.plugin(mongoosePaginate);


export default mongoose.model('grns', grnSchema);
