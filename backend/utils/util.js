//import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import argon2 from 'argon2';
import axios from 'axios';
const authserver = "http://authserver:80";

export const hashPassword = async (password) => {
    try{
        const hashPassword = await argon2.hash(password);
        // const hashPassword = await bcrypt.hash(password, 10);
        return hashPassword;
    }catch(err){
        throw new Error(err);
    }
}

export const comparePassword = async (password, hashPassword) => {
    try{
        const result = await argon2.verify(password, hashPassword);
        // const result = await bcrypt.compare(password, hashPassword);
        return result;
    }catch(err){
        throw new Error(err);
    }
} 


export const generateTeamToken = async (id,role,memberName,mobile) => {
  try{
      const token = JWT.sign({id:id,role:role,memberName:memberName,mobile: mobile }, process.env.JWT_SECRET, {
          expiresIn: 32400 // 9 hr
      });
      return token;
  }catch(err){
      throw new Error(err);
  }
}


export const generateToken = async (selectedRole,sapID,location,uID,loginPersonName) => {
    try{
        const token = JWT.sign({selectedRole:selectedRole,sapID:sapID,location:location,uID: uID,loginPersonName:loginPersonName}, process.env.JWT_SECRET, {
            expiresIn: 32400 // 9 hr
        });
        return token;
    }catch(err){
        throw new Error(err);
    }
}

export const decodeToken = async (token) => {
    try{
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        return decoded;
    }catch(err){
        throw new Error(err);
    }
}


export const validateToken = async (request, response, next) => {
    try {
      //check if token is not present.
      const token = request.headers.authorization.split(' ')[1];
      console.log('token',token);  
      if (!token) {
        return response.json({
          status: 201,
          message: "No Token Provided.",
        });
      }
  
      var tokenCache = null;
      /* try {
        tokenCache = await redisClient.get("vvad:tokens:" + request.body.token);
      } catch (error) {
        console.log("Error in cache ", error);
      } */
      if (1==2) {
        // If the key exists in Redis, return that response
        let tknCache = JSON.parse(tokenCache); // Assuming data is stored in JSON string format in Redis
        //console.log("Cache version"+cachedVersion);
        request.body.requesterID = tknCache.verifiedJwt.sapID;
        next();
      } else {
        console.log(authserver)
        //verifying the token
        const res = await axios.post(
          authserver + "/verifyToken",
          {
            token: token,
            app: "UA",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log('aaaaa', res.data);
        if (res.data.status === 200) {
          //token vrified process the requests.
          request.body.requesterID = res.data.verifiedJwt.sapID;
          //await redisClient.set("vvad:tokens:" + request.body.token, JSON.stringify(res.data), 'EX', 600);
          /* try {
            await redisClient.set(
              "vvad:tokens:" + request.body.token,
              JSON.stringify(res.data),
              "EX",
              1200
            );
          } catch (error) {
            console.log("Error in cache when saving", error);
          } */
  
          next();
        } else {
          //token verfication failed.
          console.log(`error occurred : ${res.data.message}`);
          response.json({
            status: 203,
            message: "Un-Authorize Access.",
            error: res.data.err,
          });
        }
      }
    } catch (error) {
      //handle error.
      response.json({
        status: 500,
        message: "Error Occurred. Please retry after some time.",
        error: error,
      });
    }
  };
  
