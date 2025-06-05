import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const roleSchema = new mongoose.Schema({
    roleName: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{
        section: { type: String, required: true }, 
        actions: Boolean
    }]
}, {
    timestamps: true
});

// Add pagination plugin
roleSchema.plugin(mongoosePaginate);


export default mongoose.model('roles', roleSchema);

