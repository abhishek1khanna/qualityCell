import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const materialSchema = new mongoose.Schema({
    di: { type: String, required: true },
    Name_of_the_Firm: String,
    Supplier_Address:String,
    Supplier_Mobile_No:String,
    Supplier_email:String,
    Supplier_GST:String,
    Data: [
        {
          type: Map, // Allows flexible key-value pairs
          of: mongoose.Schema.Types.Mixed, // Supports mixed data types
        },
    ],
    PONo: String,
    POQuantity: Number,
    bankGuaranteeAmount: Number,
    BGExpiryDate:Date,
    materialTag: String,
    totalQuantityReceived:{
        type: Number, default: 0
    },
    receivedQuantity:{
        type: Number, default: 0
    },
    // tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'testmasters' }],
    // labs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'labs' }],
    sapID:String,location:String,uID:String,loginPersonName:String,
    postTestAction: {
        issuedToField: { type: Boolean },
        materialReplaced: { type: Boolean },
        noticeIssued: { type: Boolean },
        uploadNotice: [{ type: String }],
        financialPenalty: { type: Boolean },
        uploadOMFinancialPenalty: [{ type: String }],
        imposedAmount: { type: Number },
        recoveryAmount: { type: Number },
        bankGuranteeAvailableAmount: { type: Number },
        bankGuranteeEncashAmount: { type: Number },
        firmBlacklisted: { type: Boolean },
        uploadOMDebarment: [{ type: String }],
        finalResult:String,
        details:String,
        recoveryDamage: { type: Boolean },
        discom:String,sapID:String,location:String,uID:String,loginPersonName:String,
        addedDate:Date

    }
}, {
    timestamps: true
});

materialSchema.plugin(mongoosePaginate); 


export default mongoose.model('materials', materialSchema);
