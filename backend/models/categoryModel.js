import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true, unique: true },
    categoryDescription: { type: String, required: true },
    sapID:String,location:String,uID:String,loginPersonName:String
}, {
    timestamps: true
});

categorySchema.plugin(mongoosePaginate);


export default mongoose.model('categories', categorySchema);
