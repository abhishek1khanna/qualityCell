import  mongoose from "mongoose";

const appVersionSchema = new mongoose.Schema({
    Version: String
},{
    timestamps: true,
});


export default mongoose.model('appversions', appVersionSchema);
