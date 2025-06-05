import  mongoose from "mongoose";
import mongoosePaginate  from 'mongoose-paginate-v2';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema({
    
    tokenVersion: { type: Number, default: 0 },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "roles", required: true },
    name: {
        type: String,
        required: true
    },
    memberOf:[
        {
          type: String, // Store multiple categories as strings
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false, // Default to false (not deleted)
    },
    gender: {
        type: String,
    },
    dob: {
        type: String,
    },
    username: {
        type: String,
        required: true,
    },
   
     role: {
        type: String,
        required: true,
       // enum: ['JEE', 'SSO', 'GANG', 'ADMIN'],
       // default: 'GANG'
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    adharID:{
        type: String,
    },
    otp: {
    token: {
        type: String,
    },
    expiry_time: {
        type: String,
    }
    },
},{
    timestamps: true
});



  
  // Method to compare a given password with the database hash
  userSchema.methods.comparePassword = function(candidatePassword) {
    return argon2.verify(this.password, candidatePassword);
  };
  
  



userSchema.plugin(mongoosePaginate);

userSchema.pre('save', function (next) {
  if (this.dob) {
    this.dob = new Date(this.dob.setHours(0, 0, 0, 0));
  }
  next();
});


export default mongoose.model('users', userSchema);
