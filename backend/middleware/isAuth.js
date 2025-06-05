import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';


export const isAuth = async (req, res, next) => {

    try{
        const token = req.headers.authorization.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Unauthorized",status:false,statusCode:401 });
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        req.encodedUser = decoded;
        next();
    }catch(err){
        return res.status(400).send({message:"error in token",status:false,statusCode:400,errorMessage:err});
     
        // res.status(401).send({message: 'Invalid token'});
        //const errormsg = new Error(err.message);
        //errormsg.statusCode = 401;
        //next(errormsg);
    }

}