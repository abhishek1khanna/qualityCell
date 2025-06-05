import materialModel from "../models/materialModel.js";
import path from "path";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import grnModel from "../models/grnModel.js";
import { sendEmail } from "./emailController.js";
import fetch from "node-fetch";
import samplingTeamModel from "../models/samplingTeamModel.js";
dotenv.config();
const UPLOAD_PATH =  'https://devops1.uppcl.org/qualitycell/uploads/';

const fetchFileAsBuffer = async (url) => {
    try {
        url = url.replace(/\\/g, '/'); // Fix backslashes in URL
        if (!url.startsWith("http")) {
            console.warn(`Skipping invalid URL: ${url}`);
            return null;
        }

        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            console.warn(`Skipping attachment (not found or inaccessible): ${url}`);
            return null;
        }

        // Use arrayBuffer() instead of buffer()
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer); // Convert to Node.js Buffer

        return { filename: url.split('/').pop(), content: buffer };
    } catch (error) {
        console.warn(`Skipping attachment (fetch error: ${error.message}): ${url}`);
        return null;
    }
};

export const addMaterial = async (req,res) => {
    try {
        
        const {
            di,
            Name_of_the_Firm,
            Supplier_Address,
            Supplier_Mobile_No,
            Supplier_email,
            Supplier_GST,
            Data,
            tests,
            labs,
            PONo,
            POQuantity,
            bankGuaranteeAmount,
            BGExpiryDate,
            materialTag
          } = req.body;
         
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        // console.log(selectedRole,sapID,location,uID,loginPersonName);
        req.body.sapID = sapID;
        req.body.location = location;
        req.body.uID = uID;
        req.body.loginPersonName = loginPersonName;  
        // Check if `di` is unique
        const existingMaterial = await materialModel.findOne({ di });
        if (existingMaterial) {
        return res.status(400).json({
            status: 400,
            message: `Material with DI ${di} already exists.`,
        });
        }


        const newMaterial = new materialModel({
            di,
            Name_of_the_Firm,
            Supplier_Address,
            Supplier_Mobile_No,
            Supplier_email,
            Supplier_GST,
            Data,
            tests,
            labs,
            sapID,
            location,
            uID,
            loginPersonName,
            PONo,
            POQuantity,
            bankGuaranteeAmount,
            BGExpiryDate,
            materialTag
          });
          
          // Save to the database
          const newSample = await newMaterial.save();

        /* const role = 'firm';
        const newMember = new samplingTeamModel({ di, memberName:Name_of_the_Firm, mobileNo:Supplier_Mobile_No, role, email:Supplier_email, sapID, location, uID,loginPersonName });
        await newMember.save(); */



        //const newSample = new materialModel(materailData);
        //await newSample.save();
        return res.status(201).json({ status:201, message: "Material added successfully", sample: newSample });
    } catch (error) {
        return res.status(500).json({ status:500,error: "Error adding Material", details: error.message });
    }
}

export const editMaterial = async (req,res) => {
    try {
        const { materialId } = req.body;
        const updateData = req.body;
        const updatedSample = await materialModel.findByIdAndUpdate(materialId, updateData, { new: true });
        if (!updatedSample) {
            return res.status(404).json({ error: "Material not found" });
        }
        return res.status(200).json({status:200,  message: "Material updated successfully", sample: updatedSample });
    } catch (error) {
        return res.status(500).json({ status:500, error: "Error updating Material", details: error.message });
    }
}

export const deleteMaterial = async (req,res) => {
    try {
        const { materialId } = req.body;
        const deletedSample = await materialModel.findByIdAndDelete(materialId);

        if (!deletedSample) {
            return res.status(404).json({ status:404, error: "Material not found" });
        }
        return res.status(200).json({ status:200, message: "Material deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status:500, error: "Error deleting Material", details: error.message });
    }

}

export const getAllMaterials = async (req,res) => {
    try {
        const { page = 1, limit = 10, di, materialName, fromDate, toDate } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        const filter = {};
        if (selectedRole == 'admin') {
        }else if (selectedRole == 'Material Management Unit') {
            filter.uID = uID;
        }else if (selectedRole === 'EE (STORE)' || selectedRole === 'AE (STORE)' || selectedRole == 'SE (STORE)' ) {
            var grnRes = await grnModel.findOne({di:di});
            if(grnRes){
                filter.location = grnRes.discom;
            }
            // Filter based on `Data.Store_Location` containing the user's name
            /* filter['Data'] = {
                $elemMatch: {
                    Store_Location: { $regex: name, $options: 'i' }, // Case-insensitive match
                },
            };*/
        }else if (selectedRole === "DQC") {
            // Exclude Transformer and Meter in the `Data` array
            filter.location = location;
            /* filter.Data = {
              $elemMatch: {
                Material_Name: { $nin: [/Transformer/i, /Meter/i] }
              }
            }; */
          } else if (selectedRole === "UQC") {

            filter.materialTag = {
                $in: [/Meter/i, /Transformer/i]
              };

            // Include only Meter and Transformer in the `Data` array
            /* filter.Data = {
              $elemMatch: {
                Material_Name: { $in: [/Meter/i, /Transformer/i] }
              }
            };*/
          }
        if (di) filter.di = di;
        if (materialName) filter.materialName = { $regex: materialName, $options: 'i' };
        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }
        
       // console.log(filter);
        const options = {
            page: parseInt(page, 10),   // Convert page to integer
            limit: parseInt(limit, 10), // Convert limit to integer
            sort: { createdAt: -1 },     // Sort by most recent users
            /* populate: {
                path: 'tests',          // Populate the 'tests' field
                select: 'testName',
                populate: {             // Nested populate for `tests`
                    path: 'labs'
                }      // Only fetch 'testName' from TestMaster
            } */
        };

        const result = await materialModel.paginate(filter, options);

        /* if (selectedRole === 'EE (STORE)' || selectedRole === 'AE (STORE)') {
            // Filter the `Data` array for each document to include only matching `Store_Location`
                result.docs.forEach((doc) => {
                    doc.Data = doc.Data.filter((data) => {
                        const storeLocation = data.Store_Location || ""; // Fallback to empty string if undefined
                        const searchName = name || ""; // Fallback to empty string if undefined
                        return storeLocation.toLowerCase().includes(searchName.toLowerCase());
                    });
                });

        }*/

        if (result.docs.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No data found'
            });
        }

        // Return success response with paginated results
        return res.status(200).json({
            status: 200,
            message: 'List of materials ',
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
        return res.status(500).json({ status:500, error: "Error retrieving Materials", details: error.message });
    }
}


export const managePostTestsAction = async (req, res) => {
    try {
        const { di, issuedToField, noticeIssued, materialReplaced, financialPenalty, imposedAmount, recoveryAmount, bankGuranteeAvailableAmount, bankGuranteeEncashAmount, firmBlacklisted, finalResult, details, action, recoveryDamage  } = req.body;
        const { selectedRole,sapID,location,uID,loginPersonName } = req.encodedUser;

        // Fetch the sample document
        const sample = await materialModel.findById(di);
        if (!sample) return res.status(404).json({ status: 404, message: "di not found" });

        var postTestAction = {}

        const uploadedFiles = {
            uploadNotice: req.files?.["uploadNotice"]?.map(file => path.join(UPLOAD_PATH,  file.filename)) || sample.postTestAction?.uploadNotice || [],
            uploadOMFinancialPenalty: req.files?.["uploadOMFinancialPenalty"]?.map(file => path.join(UPLOAD_PATH,  file.filename)) || sample.postTestAction?.uploadOMFinancialPenalty || [],
            uploadOMDebarment: req.files?.["uploadOMDebarment"]?.map(file => path.join(UPLOAD_PATH,  file.filename)) || sample.postTestAction?.uploadOMDebarment || [],
        };


        // console.log(grn);
        // Uploaded files mapping
        switch (action) {
            case 'add':
                /* if (postTestAction) {
                    return res.status(400).json({ status: 400, message: "Post Test Action already exists" });
                }*/
        
                postTestAction = {
                    issuedToField,
                    noticeIssued,
                    materialReplaced,
                    financialPenalty,
                    imposedAmount,
                    bankGuranteeAvailableAmount,
                    bankGuranteeEncashAmount,
                    firmBlacklisted,
                    finalResult,
                    details,
                    recoveryAmount,
                    recoveryDamage,
                    sapID,
                    location,
                    uID,
                    loginPersonName,
                    ...uploadedFiles,
                };
                break;

            case 'update':
                
                /* if (!postTestAction) {
                    return res.status(404).json({ status: 404, message: "Post Test Action not found" });
                }*/

                if (issuedToField !== undefined) postTestAction.issuedToField = issuedToField;
                if (noticeIssued !== undefined) postTestAction.noticeIssued = noticeIssued;
                if (materialReplaced !== undefined) postTestAction.materialReplaced = materialReplaced;
                if (financialPenalty !== undefined) postTestAction.financialPenalty = financialPenalty;
                if (imposedAmount !== undefined) postTestAction.imposedAmount = imposedAmount;
                if (bankGuranteeAvailableAmount !== undefined) postTestAction.bankGuranteeAvailableAmount = bankGuranteeAvailableAmount;
                if (bankGuranteeEncashAmount !== undefined) postTestAction.bankGuranteeEncashAmount = bankGuranteeEncashAmount;
                if (firmBlacklisted !== undefined) postTestAction.firmBlacklisted = firmBlacklisted;
                if (finalResult !== undefined) postTestAction.finalResult = finalResult;
                if (details !== undefined) postTestAction.details = details;
                if (recoveryAmount !== undefined) postTestAction.recoveryAmount = recoveryAmount;
                if (recoveryDamage !== undefined) postTestAction.recoveryDamage = recoveryDamage;
    

                // Update file arrays only if new files are uploaded
                if (uploadedFiles.uploadNotice.length > 0) postTestAction.uploadNotice = uploadedFiles.uploadNotice;
                if (uploadedFiles.uploadOMFinancialPenalty.length > 0) postTestAction.uploadOMFinancialPenalty = uploadedFiles.uploadOMFinancialPenalty;
                if (uploadedFiles.uploadOMDebarment.length > 0) postTestAction.uploadOMDebarment = uploadedFiles.uploadOMDebarment;
                break;

            case 'delete':
                if (!postTestAction) {
                    return res.status(404).json({ status: 404, message: "Post Test Action not found" });
                }
                postTestAction = undefined; // Clear the postTestAction object
                break;

            case 'list':
                return res.status(200).json({
                    status: 200,
                    message: "Post Test Action retrieved successfully",
                    postTestAction: postTestAction || null
                });

            default:
                return res.status(400).json({ status: 400, message: "Invalid action" });
        }

        // Save the updated sample document
        sample.postTestAction = postTestAction;
        await sample.save();

        if (action == 'add' || action == 'update') {
            var matRes = await materialModel.findById(di);
            var recipient = matRes?.Supplier_email;
        
            if (1==2) {
                const selectedItemsTable = `
                    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                        <tr><td>Recovery Amount</td><td>${recoveryAmount}</td></tr> 
                        <tr><td>Recovery Damage</td><td>${recoveryDamage}</td></tr> 
                        <tr><td>Issued To Field</td><td>${issuedToField}</td></tr> 
                        <tr><td>Final Result</td><td>${finalResult}</td></tr>  
                        <tr><td>Details</td><td>${details}</td></tr> 
                    </table>`;
            
                let fileUrls = [
                    ...(sample.postTestAction.uploadOMFinancialPenalty || []),
                    ...(sample.postTestAction.uploadOMDebarment || []),
                    ...(sample.postTestAction.uploadNotice || [])
                ].map(url => url.replace(/\\/g, '/')); // Ensure correct URL format
            
                let attachments = (await Promise.all(fileUrls.map(fetchFileAsBuffer))).filter(Boolean);
                
                // console.log("Final Attachments:", attachments);
            
                sendEmail(
                    recipient,
                    `DI ${sample.di} Final Test Results`,
                    `<br><br>${selectedItemsTable}`,
                    "",
                    attachments
                );
            }
        }

        return res.status(200).json({
            status: 200,
            message: `Post Test Action ${action}ed successfully`,
            postTestAction: postTestAction || null
        });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};


