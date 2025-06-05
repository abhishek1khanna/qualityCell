import  mongoose from "mongoose";

const receiveMaterialSchema = new mongoose.Schema({
    grnId: { type: mongoose.Schema.Types.ObjectId, ref: "grns" },
    serials: [{
      Serial_NO: String
    }]
  }, {
    timestamps: true
});

  
export default mongoose.model('received-materials', receiveMaterialSchema);
  