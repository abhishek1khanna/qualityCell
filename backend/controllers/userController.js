// import asyncHandler from "express-async-handler";
import userModel from "../models/userModel.js";
import JWT from 'jsonwebtoken';
import { generateTeamToken, generateToken,hashPassword } from "../utils/util.js";
import mongoose from "mongoose";
import axios from "axios";
import path from 'path';
import csv from 'csvtojson';
import rolesModel from "../models/rolesModel.js";
import samplingTeamModel from "../models/samplingTeamModel.js";

const __dirname = path.resolve(path.dirname('')); 



export const registerController = async (req,res,next) => {
    try{
    const {name,username,email,password,phone,role} = req.body;
   //  var { discom } = req.encodedUser;
    if (!name || !username   || !phone   || !role ) {

       res.status(400).send({message:"All fields are required",status:"false",statusCode:400,user:[]});
    }

    const existingUserName = await userModel.findOne({ username });
    if (existingUserName) {
      return res.status(400).json({
            message: 'Username already exists',
            statusCode: 400,
            user: {}
          });
    }   


    const existingUser = await userModel.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
            message: 'User with this mobile number already exists',
            statusCode: 400,
            user: {}
          });
    }

    req.body.password = await hashPassword('123456');
    req.body.lavel = 'discom';
    const user = await new userModel(req.body).save();
    return res.status(201).send({message:"user created successfully",status:201,user:user});
  } catch (error) {
    return res.status(500).send({message:"error occured in user registration",status:500,user:[],errorMessage:error});
  }
}



export const listUsers = async (req, res) => {
    try {
        // Extract page and limit from query params, with default values
        const { page = 1, limit = 10 } = req.body;
       //  var { discom } = req.encodedUser;

        // Paginate query to find users with role 'dispatcher'
        const options = {
            page: parseInt(page, 10),   // Convert page to integer
            limit: parseInt(limit, 10), // Convert limit to integer
            sort: { createdAt: -1 }     // Sort by most recent users
        };

        const result = await userModel.paginate({ }, options);

        // Check if there are users to return
        if (result.docs.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No users found'
            });
        }

        // Return success response with paginated results
        res.status(200).json({
            status: 200,
            message: 'List of users ',
            data: result.docs,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            nextPage: result.nextPage,
            prevPage: result.prevPage,
            limit: result.limit
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Error fetching dispatchers',
            error: error.message
        });
    }
};





export const loginController = async (req,res,next) => {

    try{
    const {username,password,type } = req.body;
    if (!username || !password || !type ) {
        return res.status(400).send({message:"All fields are required",status:false,statusCode:400,user:{}});
    }


    if(type == 'admin'){
        const admin = await userModel.findOne({username:username});
        if (!admin) {
            return res.status(404).send({message:"User not found",status:404,userData:{}});
        }

        const isMatch = await admin.comparePassword(password);

        if (isMatch) {
        } else {
          return res.status(400).send({message:"Invalid password",status:400,user:{}});
        }

        admin.tokenVersion += 1;
        await admin.save();

        const token = await generateToken(admin._id,'admin',username,admin.tokenVersion);
        return res.status(200).send({message:"user logged in successfully",status:200, userData: admin,token:token,role:'admin'});
    }
    else if (type == 'user'){
        

        const substation = await userModel.findOne({username:username});
        if (!substation) {
            return res.status(404).send({message:"User not found",status:404,userData:{}});
        }

        const isMatch = await substation.comparePassword(password);

        if (isMatch) {
        } else {
          return res.status(400).send({message:"Invalid password",status:400,user:{}});
        }

        substation.tokenVersion += 1;
        await substation.save();


        // console.log(substation.discom);
        const token = await generateToken(substation._id,'user',username,substation.tokenVersion);
        return res.status(200).send({message:"user logged in successfully",status:200, userData: substation,token:token,role:'user'});


    }
    
     }catch(error){
        return res.status(500).send({message:"error occured in user login",status:false,statusCode:500,user:{},errorMessage:error});
    }
};

export const logoutController = async (req, res) => {
    try{
       if(!req.headers.authorization){
            return res.status(401).send({message:"unauthorized",status:false,statusCode:401});
        }
        const tokenStr = req.headers.authorization;
        const token = tokenStr.split(' ')[1];
        const decoded = await JWT.verify(token, process.env.JWT_SECRET);
        const {_id} = decoded;
        const user = await userModel.findOne({_id:_id});
        if(!user){
            return res.status(401).send({message:"unauthorized",status:false,statusCode:401});
        }
       // const token1 = await generateToken(_id);
        await JWT.destroy(token);
        // await JWT.destroy(_id);
        return res.status(200).send({message:"user logged out successfully",status:true,statusCode:200});
    }
    catch(err){
        return res.status(500).send({message:"error occured in user logout",status:false,statusCode:500,errorMessage:err});
       
    }
    
}



export const deleteUserController = async (req,res,next) => {

    try {
        const { id } = req.body;

        const deletedUser= await userModel.findByIdAndUpdate(
            id,
            { isDeleted: true }, // Set a flag to mark it as deleted
            { new: true }
        );

        if (!deletedUser) {
            return res.status(404).json({
                status: 404,
                message: 'user not found',
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'User deleted successfully',
            data: deletedUser,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error deleting user',
            error: error.message,
        });
    }


};




export const updateUserController = async (req,res,next) => {
   try{

    const {name,username,email,phone,id,esclateTime,memberOf} = req.body;

    if (!name || !username ||   !phone   ) {

        res.status(400).send({message:"All fields are required",status:"failed",statusCode:400,user:[]});

    }


    const existingUserName = await userModel.findOne({ 
        username, 
        _id: { $ne: new mongoose.Types.ObjectId(id) } // Exclude the current record
      });
  
      if (existingUserName) {
        return res.status(400).json({
              message: 'UserName already exists',
              statusCode: 400,
              user: {}
            });
      }



    const existingUser = await userModel.findOne({ 
        phone, 
        _id: { $ne: new mongoose.Types.ObjectId(id) } // Exclude the current record
      });
  
      if (existingUser) {
        return res.status(400).json({
              message: 'User with this mobile number already exists',
              statusCode: 400,
              user: {}
            });
      }


    // const {_id} = req.encodedUser;
    const user = await userModel.findByIdAndUpdate(id,req.body,{new:true});
    if(!user){
        res.status(404).send({message:"User not found",status:"failed",statusCode:404,user:[]});
    }
     res.status(200).send({message:"User updated",status:"success",statusCode:200,user:user});
    
    }catch(error){
        res.status(500).send({message:"error occured in user updation",status:"failed",statusCode:500,errorMessage:error});

    }    
};




export const mobileLoginController = async (req, res) => {

    try{
        const { type } = req.body;
    if (type == 'sampleteam'  ){ // || type == 'sso'

        const { otp, mobile_number,fb_token } = req.body;
        if (!otp || !mobile_number || !type ) {
            return res.status(404).send({message:"fields can not be left blank",status:false,statusCode:404,user:{}});
        }
       

    const user = await samplingTeamModel.findOne({mobileNo:mobile_number,"otp.token":otp});
    if (!user) {
       return res.status(404).send({message:"User not found",status:false,statusCode:404,user:{}});
    }
    let otpData = user.otp;
    
    const currentDateTime = new Date();
    const expiry_time = new Date(otpData.expiry_time);

    if (otp == otpData.token && currentDateTime.getTime() <= expiry_time.getTime()) {
       

        //user.tokenVersion += 1;
       // await user.save();


        const token = await generateTeamToken(user._id,'teammember',user.memberName,user.mobileNo);
        

        /* if(fb_token){
            user.fb_token = fb_token;
            await user.save();
        } */
        return res.status(200).send({message:"user logged in successfully",status:200,userData:user,token:token,role:'team'});

    }else{
         return res.status(400).json({ message: 'Invalid OTP', statusCode: 400,status:false,user:{} });
    }

    }


    }catch(e){
        return res.status(500).send({message:"error occured in user login",status:500,errorMessage:e,userData:{}});
    }

}


function generateOTP() {
    let otp = Math.floor(Math.random() * 1000000);
    otp = otp.toString().padStart(6, '0');
    return otp;
}




export const getOTPController = async (req, res) => {
    const { mobile_number } = req.body;
    // Find the mobile_number in the database
    samplingTeamModel.findOne({ mobileNo: mobile_number })
        .then(async (user) => {

            if (!user) {
                return res.status(400).send({ message: 'Mobile Number does not exist.', statusCode:400,status: false });
            }
            const otp = generateOTP();
            const dateTime = new Date();
            const expiry_time = new Date(dateTime.getTime() + 5 * 60 * 1000); // Add 5 minutes in milliseconds
            // await sendPushNotification(user.fb_token, 'otp to login', otp); 

            samplingTeamModel.findOneAndUpdate(
                { mobileNo: mobile_number },
                { $set: { otp: { token: otp, expiry_time: expiry_time.toISOString() } } }

            ).then(async (result) => {

               // console.log(mobile_number,otp);
               const data = {
                    username: "jiocx-uppcl",
                    password: "tVUTA5k9cq9HktMR",
                    sender_id: "UPPCLT",
                    to: mobile_number.toString(),
                    sms_type: "O",
                    sms_content_type: "Static",
                    body: `Dear User, Your OTP for login is ${otp}. Please do not share this OTP with anyone. -UPPCL.`,
                    agency_name: "UPPCL dev",
                  };
            
                  const url = "https://uppcl.jiocx.com/apggw/uppcl/sms/v1/send";
            
                /*  const responseServer = await axios.post(url, data, {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });*/
            


                return res.status(200).send({ otp, message: 'Otp has been sent successfully on your mobile no.', statusCode: 200, status:true });
            })
                .catch((error) => {
                    return res.status(400).send({ message: 'Internal server error. ', statusCode: 400, status:false,errorMessage:error });
                });
        })
        .catch((error) => {
            console.error("Error finding user:", error);
            return res.status(400).json({ message: 'Internal server error. ', statusCode: 400,status:false,errorMessage:error });
        });
};




export const changePasswordController = async (req, res) => {
    try {
  
       const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
  
      const { currentPassword, newPassword } = req.body;
  
      if ( !currentPassword || !newPassword) {
        return res.status(400).send({ message: "All fields are required", status: 400 });
      }
  
      const user = await userModel.findById(_id);
  
      if (!user) {
        return res.status(404).send({ message: "User not found", status: 404 });
      }
  
      const isMatch = await user.comparePassword(currentPassword);
  
      if (!isMatch) {
        return res.status(400).send({ message: "Invalid current password", status: 400 });
      }
  

      user.password = await hashPassword(newPassword);
      await user.save();
  
      return res.status(200).send({ message: "Password changed successfully", status: 200 });
    } catch (error) {
      return res.status(500).send({ message: "Error occurred while changing password", status: 500, error: error.message });
    }
  }


  export const fetchUserPermissions = async (req, res) => {
    try {
        const { selectedRole, sapID, location, uID, loginPersonName } = req.body; // Role selected on the frontend
        if (!selectedRole) {
            return res.status(400).json({ status: 400, message: "Role is required" });
        }
        var roleInside = '';
        if (selectedRole == 'UPPCL_DQC_DISCOM' || selectedRole == 'UPPCL_DIRT_DISCOM'){
            roleInside = 'DQC';
        }if (selectedRole == 'UPPCL_UQC_UPPCL' || selectedRole == 'UPPCL_DIRD_UPPCL'){
            roleInside = 'UQC';
        }else if (selectedRole == 'UPPCL_DIRD_UPPCL'){
            roleInside = 'DirectorD';
        }  
        else if (selectedRole == 'UPPCL_SEMM_DISCOM'){
            roleInside = 'Material Management Unit';
        }
        else if (selectedRole == 'UPPCL_AE_STORE'){
            roleInside = 'AE (STORE)';
        }else if (selectedRole == 'UPPCL_EE_STORE'){
            roleInside = 'EE (STORE)';
        }else if (selectedRole == 'UPPCL_SESTORE_DISCOM'){
            roleInside = 'SE (STORE)';
        }else if (selectedRole == 'REPORT'){
            roleInside = 'REPORT';
        }else if (selectedRole == 'admin'){
            roleInside = 'admin';
        }

        // Fetch permissions for the selected role
        const roleData = await rolesModel.findOne({ roleName: roleInside }).lean();
        if (!roleData) {
            return res.status(404).json({ status: 404, message: "Role not found" });
        }
        const token = await generateToken(roleInside,sapID,location,uID,loginPersonName);
        return res.status(200).json({
            status: 200,
            message: "Permissions fetched successfully",
            qualityCellUser: {
                sapID: sapID,
                location: location,
                uID: uID,
                loginPersonName:loginPersonName
            },
            role: roleData.roleName,
            permissions: roleData.permissions,
            token:token
        });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};
