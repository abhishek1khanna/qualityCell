import sampleModel from "../models/sampleModel.js";
import path from "path";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
const UPLOAD_PATH =  'https://devops1.uppcl.org/qualitycell/uploads/';


export const addSample = async (req,res) => {
    try {
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        req.body.sapID = sapID;
        req.body.name = name;
        req.body.uID = uID;
        const sampleData = req.body;
        const newSample = new sampleModel(sampleData);
        await newSample.save();
        return res.status(201).json({ status:201, message: "Material added successfully", sample: newSample });
    } catch (error) {
        return res.status(500).json({ status:500,error: "Error adding Material", details: error.message });
    }
}

export const editSample = async (req,res) => {
    try {
        const { sampleId,updateData } = req.body;

        const updatedSample = await sampleModel.findByIdAndUpdate(sampleId, updateData, { new: true });
        if (!updatedSample) {
            return res.status(404).json({ error: "Material not found" });
        }
        return res.status(200).json({status:200,  message: "Material updated successfully", sample: updatedSample });
    } catch (error) {
        return res.status(500).json({ status:500, error: "Error updating Material", details: error.message });
    }
}

export const deleteSample = async (req,res) => {
    try {
        const { sampleId } = req.body;
        const deletedSample = await sampleModel.findByIdAndDelete(sampleId);

        if (!deletedSample) {
            return res.status(404).json({ status:404, error: "Material not found" });
        }
        return res.status(200).json({ status:200, message: "Material deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status:500, error: "Error deleting Material", details: error.message });
    }

}

export const getAllSample = async (req,res) => {
    try {
        const { page = 1, limit = 10, di, materialName, fromDate, toDate, grnNo } = req.body;
        
        const filter = {};
        if (di) filter.di = di;
        if (materialName) filter.materialName = { $regex: materialName, $options: 'i' };
        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }
        if (grnNo) {
            filter['grns.grnNo'] = grnNo; // Filter nested grnNo in the grns array
        }

        const options = {
            page: parseInt(page, 10),   // Convert page to integer
            limit: parseInt(limit, 10), // Convert limit to integer
            sort: { createdAt: -1 },     // Sort by most recent users
            populate: {
                path: 'tests',          // Populate the 'tests' field
                select: 'testName'      // Only fetch 'testName' from TestMaster
            }
        };

        const result = await sampleModel.paginate(filter, options);

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


export const addGRN = async (req,res) => {
    try {
        const {grnData, sampleID} = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;

        const sample = await sampleModel.findById(sampleID);
        if (!sample) {
            return res.status(404).json({ status:404, error: "materail not found" });
        }
        grnData.sapID = sapID;
        grnData.name = name;
        grnData.uID = uID;
        sample.grns.push(grnData);
        await sample.save();
        return res.status(201).json({ status:201, message: "GRN added successfully", sample });
    } catch (error) {
        return res.status(500).json({ status:500,error: "Error adding GRN", details: error.message });
    }
}


export const updateGRN = async (req,res) => {
    try {
        const {updatedGRN, sampleID, grnId} = req.body;

        const sample = await sampleModel.findById(sampleID);
        if (!sample) return res.status(404).json({ status:404, error: "Material not found" });

        const grn = sample.grns.id(grnId);
        if (!grn) return res.status(404).json({ status:404, error: "GRN not found" });

        Object.assign(grn, updatedGRN);
        await sample.save();
        res.status(200).json({ status:200,  message: "GRN updated successfully", sample });

    } catch (error) {
        return res.status(500).json({ status:500,error: "Error adding GRN", details: error.message });
    }
}

export const deleteGRN = async (req,res) => {
    try {
        const {sampleID, grnId} = req.body;

        const sample = await sampleModel.findById(sampleID);
        if (!sample) return res.status(404).json({ status:404, error: "Sample not found" });

        sample.grns = sample.grns.filter(grn => grn._id.toString() !== grnId);
        await sample.save();

        return res.status(200).json({ status:200,message: "GRN deleted successfully", sample });
    } catch (error) {
        return res.status(500).json({ status:500,error: "Error deletin GRN", details: error.message });
    }
}


export const listGRN = async (req, res) => {
    try {
        const { page = 1, limit = 10, sampleId } = req.body;

        // Options for pagination
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { 'grns.createdAt': -1 }, // Sort GRNs by createdAt in descending order
            select: 'grns', // Only fetch the GRNs field
            lean: true
        };

        // Find the GRNs within the sample
        const sample = await sampleModel.findById(sampleId);
        if (!sample) {
            return res.status(404).json({ status:404, message: 'Sample not found' });
        }

        // Paginate GRNs array
        const grnsPaginated = await sampleModel.paginate({ _id: sampleId }, options);

        return res.status(200).json({
            status:200,
            page: grnsPaginated.page,
            limit: grnsPaginated.limit,
            totalGRNs: grnsPaginated.totalDocs,
            totalPages: grnsPaginated.totalPages,
            grns: grnsPaginated.docs[0]?.grns || []
        });
    } catch (error) {
        return res.status(500).json({ status:500, error: error.message });
    }
};


export const generateAutoSamples = async (req, res) => {
    try {
        const { sampleId, sealDetails, sealingDate, numItems, teamMembers } = req.body;
        const { selectedRole,sapID,location,uID,loginPersonName } = req.encodedUser;

        // Find the sample by ID
        const sample = await sampleModel.findById(sampleId);
        if (!sample) {
            return res.status(404).json({ status: 404, message: "Sample not found" });
        }

        // Check if there are GRNs available
        if (!sample.grns || sample.grns.length === 0) {
            return res.status(400).json({ status: 400, message: "No GRNs available in the sample to generate auto-samples" });
        }

        // Calculate total items across all GRNs
        const totalItems = sample.grns.reduce((sum, grn) => {
            return sum + (grn.toSerial - grn.fromSerial + 1);
        }, 0);

        if (numItems > totalItems) {
            return res.status(400).json({
                status: 400,
                message: `Requested ${numItems} items exceed available items (${totalItems}).`,
            });
        }

        // Allocate items across GRNs
        let itemsRemaining = numItems;
        const selectedItems = [];
        const selectedGRNs = [];

        for (const grn of sample.grns) {
            if (itemsRemaining <= 0) break;

            const grnTotalItems = grn.toSerial - grn.fromSerial + 1;
            const itemsToSelect = Math.min(itemsRemaining, grnTotalItems);

            // Generate random serial numbers within the range
            const grnSelectedItems = [];
            while (grnSelectedItems.length < itemsToSelect) {
                const randomSerial = Math.floor(
                    Math.random() * (grn.toSerial - grn.fromSerial + 1)
                ) + grn.fromSerial;

                if (!grnSelectedItems.includes(randomSerial)) {
                    grnSelectedItems.push(randomSerial);
                }
            }

            itemsRemaining -= itemsToSelect;
            selectedItems.push(...grnSelectedItems);
            selectedGRNs.push({
                grnNo: grn.grnNo,
                selectedItems: grnSelectedItems,
            });
        }

        // Add sealing details
        const newSealingDetails = {
            sealDetails: sealDetails,
            sealingDate: sealingDate,
            sapID: sapID,
            name: name,
            uID: uID,
        };

        selectedGRNs.forEach(selectedGRN => {
            const grn = sample.grns.find(g => g.grnNo === selectedGRN.grnNo);
            if (grn) {
                grn.sealingDetails.push({
                    ...newSealingDetails,
                    selectedItems: selectedGRN.selectedItems,
                });
            }
        });

        // Save the updated sample
        await sample.save();

        return res.status(200).json({
            status: 200,
            message: `${numItems} items selected and sealing details added successfully.`,
            selectedGRNs,
        });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};




export const addSealingDetails = async (req, res) => {
    try {
        const { sampleId, grnNo, sealDetails, sealingDate } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;

        const uploadedPhotographs = req.files["photographs"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || [];
        const uploadedVideos = req.files["video"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || [];
    

        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status:404, message: "Sample not found" });

        /* const grn = sample.grns.find(grn => grn.grnNo === grnNo);
        if (!grn) return res.status(404).json({ status:404, message: "GRN not found" });*/

        const newSealingDetails = {
            sealDetails: sealDetails,
            sealingDate: sealingDate,
            photographs: uploadedPhotographs,
            video: uploadedVideos,
            sapID:sapID,
            name: name,
            uID: uID
        };   
        
        grn.sealingDetails.push(newSealingDetails);
        await sample.save();

        return res.status(200).json({ status:200, message: "Sealing Details added successfully", sample });
    } catch (error) {
        return res.status(500).json({ status:500, error: error.message });
    }
};


export const editSealingDetails = async (req, res) => {
    try {
        const { sampleId, grnNo, sealingDetailId, sealDetails, sealingDate } = req.body;

        const uploadedPhotographs = req.files["photographs"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || [];
        const uploadedVideos = req.files["video"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || [];
       
        
        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status:404, message: "Sample not found" });

        /* const grn = sample.grns.find(grn => grn.grnNo === grnNo);
        if (!grn) return res.status(404).json({ status:404, message: "GRN not found" });*/

        const sealingDetail = grn.sealingDetails.id(sealingDetailId);
        if (!sealingDetail) return res.status(404).json({ status:404, message: "Sealing Detail not found" });

    // Update fields conditionally
    if (sealDetails) sealingDetail.sealDetails = sealDetails;
    if (sealingDate) sealingDetail.sealingDate = sealingDate;
    if (uploadedPhotographs.length > 0) sealingDetail.photographs = uploadedPhotographs;
    if (uploadedVideos.length > 0) sealingDetail.video = uploadedVideos;

    // Save the updated sample
    await sample.save();     
        
        
       //  Object.assign(sealingDetail, updates);
     

        return res.status(200).json({ status:200,message: "Sealing Details updated successfully", sample });
    } catch (error) {
        return res.status(500).json({ status:500, error: error.message });
    }
};



export const deleteSealingDetails = async (req, res) => {
    try {
        const { sampleId, grnNo, sealingDetailId } = req.body;

        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status: 404, message: "Sample not found" });

        // Find the correct GRN
        const grn = sample.grns.find(grn => grn.grnNo === grnNo);
        if (!grn) return res.status(404).json({ status: 404, message: "GRN not found" });

        // Find the index of the sealingDetails entry to remove
        const sealingIndex = grn.sealingDetails.findIndex(detail => detail._id.toString() === sealingDetailId);
        if (sealingIndex === -1) return res.status(404).json({ status: 404, message: "Sealing Detail not found" });

        // Remove the sealing detail using splice
        grn.sealingDetails.splice(sealingIndex, 1);

        // Save the document
        await sample.save();

        return res.status(200).json({ status: 200, message: "Sealing Details deleted successfully", sample });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};

export const listSealingDetails = async (req, res) => {
    try {
        const { grnNo,sampleID } = req.body;

        // Fetch the Sample document containing the GRN with the given grnNo
        const sample = await sampleModel.findOne(
            { _id: new mongoose.Types.ObjectId(sampleID), 'grns.grnNo': grnNo }, // Match the grnNo inside grns array
            { 'grns.$': 1 } // Project only the GRN that matches the condition
        ).lean();

        if (!sample || !sample.grns || sample.grns.length === 0) {
            return res.status(404).json({ status:404, message: 'GRN not found' });
        }

        // Extract sealingDetails from the matched GRN
        const sealingDetails = sample.grns[0]?.sealingDetails || [];

        return res.status(200).json({
            status:200,
            grnNo: grnNo,
            sealingDetails: sealingDetails
        });
    } catch (error) {
        return res.status(500).json({ status:500, error: error.message });
    }
};



export const manageFeePayment = async (req, res) => {
    try {

        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;

        const { sampleId, grnNo, sealingDetailId, action, paymentId, feeDetails } = req.body;
        

        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status:404, message: "Sample not found" });

        const sealingDetail = sample.grns.find(grn => grn.grnNo === grnNo)
            ?.sealingDetails.id(sealingDetailId);

        if (!sealingDetail) return res.status(404).json({ status:404, message: "Sealing Detail not found" });
        // Manage payments
        switch (action) {
            case 'add':
                feeDetails.sapID = sapID;
                feeDetails.name = name;
                feeDetails.uID = uID;
                sealingDetail.feesPayment.push(feeDetails);
                break;
            case 'edit':
                const payment = sealingDetail.feesPayment.id(paymentId);
                if (!payment) return res.status(404).json({ status:404,  message: "payment detail not found" });
                Object.assign(payment, feeDetails);
                break;
            case 'delete':
                    // Check if feesPayment exists and is an array
                    if (!Array.isArray(sealingDetail.feesPayment)) {
                        return res.status(404).json({ status: 404, message: 'Fees payment details not found' });
                    }
                
                    // Find the index of the payment to delete
                    const feeIndexToDelete = sealingDetail.feesPayment.findIndex(
                        (feesDetail) => feesDetail._id.toString() === paymentId
                    );
                
                    if (feeIndexToDelete === -1) {
                        return res.status(404).json({ status: 404, message: 'Payment detail not found' });
                    }
                
                    // Remove the payment using splice
                    sealingDetail.feesPayment.splice(feeIndexToDelete, 1);
                
                    break;
            case 'list':
                return res.status(200).json({ 
                    status: 200, 
                    message: "Payment listed successfully", 
                    teamMembers: sealingDetail.feesPayment 
                });    
            default:
                return res.status(400).json({ status:400, message: "Invalid action" });
        }

        await sample.save();
        return res.status(200).json({ status:200, message: `Payment ${action}ed successfully`, sample });
  


    } catch (error) {
      return res.status(500).json({ status: 500, message: error.message });
    }
  };
  



export const manageTeamMembers = async (req, res) => {
    try {
        const { sampleId, grnNo, sealingDetailId, action, teamMemberId, teamMember } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;


        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status:404, message: "Sample not found" });

        const sealingDetail = sample.grns.find(grn => grn.grnNo === grnNo)
            ?.sealingDetails.id(sealingDetailId);

        if (!sealingDetail) return res.status(404).json({ status:404, message: "Sealing Detail not found" });

        // Manage team members
        switch (action) {
            case 'add':
                teamMember.sapID = sapID;
                teamMember.name = name;
                teamMember.uID = uID;
                sealingDetail.teamMembers.push(teamMember);
                break;
            case 'edit':
                const member = sealingDetail.teamMembers.id(teamMemberId);
                if (!member) return res.status(404).json({ status:404,  message: "Team Member not found" });
                Object.assign(member, teamMember);
                break;
            case 'delete':
                // Find the index of the team member
                const teamMemberIndex = sealingDetail.teamMembers.findIndex(member => member._id.toString() === teamMemberId);
            
                if (teamMemberIndex === -1) {
                    return res.status(404).json({ status: 404, message: "Team member not found" });
                }
            
                // Remove the team member using splice
                sealingDetail.teamMembers.splice(teamMemberIndex, 1);
                break;
            case 'list':
                return res.status(200).json({ 
                    status: 200, 
                    message: "Team Members listed successfully", 
                    teamMembers: sealingDetail.teamMembers 
                });    
            default:
                return res.status(400).json({ status:400, message: "Invalid action" });
        }

        await sample.save();
        return res.status(200).json({ status:200, message: `Team Member ${action}ed successfully`, sample });
    } catch (error) {
        return res.status(500).json({ status:500, error: error.message });
    }
};


export const manageTestResults = async (req, res) => {
    try {
        const { sampleId, grnNo, sealingDetailId, action, testResultId, testResult } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;

        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status:404, message: "Sample not found" });

        const sealingDetail = sample.grns.find(grn => grn.grnNo === grnNo)
            ?.sealingDetails.id(sealingDetailId);

        if (!sealingDetail) return res.status(404).json({ status:404, message: "Sealing Detail not found" });

        // Manage test results
        switch (action) {
            case 'add':
                testResult.sapID = sapID;
                testResult.name = name;
                testResult.uID = uID;
                sealingDetail.testResults.push(testResult);
                break;
            case 'edit':
                const result = sealingDetail.testResults.id(testResultId);
                if (!result) return res.status(404).json({ status:404, message: "Test Result not found" });
                Object.assign(result, testResult);
                break;
            case 'delete':
                // Find the index of the team member
                const testIndex = sealingDetail.testResults.findIndex(tests => tests._id.toString() === testResultId);
            
                if (testIndex === -1) {
                    return res.status(404).json({ status: 404, message: "Test Result not found" });
                }
            
                // Remove the team member using splice
                sealingDetail.testResults.splice(testIndex, 1);
                break;
            case 'list':
                return res.status(200).json({
                    status: 200,
                    message: "Test Results listed successfully",
                    testResults: sealingDetail.testResults
                });    
            default:
                return res.status(400).json({ status:400, message: "Invalid action" });
        }

        await sample.save();
        return res.status(200).json({ status:200, message: `Test Result ${action}ed successfully`, sample });
    } catch (error) {
        return res.status(500).json({ status:500, error: error.message });
    }
};

export const manageItems = async (req, res) => {
    try {
        const { sampleId, grnNo, sealingDetailId, type, action, itemId, item } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;


        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status:404, message: "Sample not found" });

        const sealingDetail = sample.grns.find(grn => grn.grnNo === grnNo)
            ?.sealingDetails.id(sealingDetailId);

        if (!sealingDetail) return res.status(404).json({  status:404, message: "Sealing Detail not found" });

        // Select the correct array: itemsSent or itemsReceived
        const itemsArray = type === 'sent' ? sealingDetail.itemsSent : sealingDetail.itemsReceived;

        switch (action) {
            case 'add':
                item.sapID = sapID;
                item.name = name;
                item.uID = uID;
                itemsArray.push(item);
                break;
            case 'edit':
                const existingItem = itemsArray.id(itemId);
                if (!existingItem) return res.status(404).json({  status:404, message: "Item not found" });
                Object.assign(existingItem, item);
                break;
            case 'delete':

                if (type == 'sent') {
                const itemIndex = sealingDetail.itemsSent.findIndex(item => item._id.toString() === itemId);
            
                if (itemIndex === -1) {
                    return res.status(404).json({ status: 404, message: "Data not found" });
                }
            
                // Remove the team member using splice
                sealingDetail.itemsSent.splice(itemIndex, 1);
                }else{

                    const itemIndex = sealingDetail.itemsReceived.findIndex(item => item._id.toString() === itemId);
            
                    if (itemIndex === -1) {
                        return res.status(404).json({ status: 404, message: "Data not found" });
                    }
                
                    // Remove the team member using splice
                    sealingDetail.itemsReceived.splice(itemIndex, 1);
    

                }
                break;
            case 'list':
                return res.status(200).json({
                    status: 200,
                    message: `Items ${type} listed successfully`,
                    items: itemsArray
                });    
            default:
                return res.status(400).json({  status:400, message: "Invalid action" });
        }

        await sample.save();
        return res.status(200).json({ status:200, message: `Item ${type} ${action}ed successfully`, sample });
    } catch (error) {
        return res.status(500).json({ status:500, error: error.message });
    }
};



export const managePostTestActionBk = async (req, res) => {
    try {
        const { sampleId, grnNo, action, postTest } = req.body;

        // Fetch the sample document
        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status: 404, message: "Sample not found" });

        // Find the specific GRN by grnNo
        const grn = sample.grns.find(grn => grn.grnNo === grnNo);
        if (!grn) return res.status(404).json({ status: 404, message: "GRN not found" });

        switch (action) {
            case 'add':
                // console.log('grn.postTestAction',grn.postTestAction);
                if (grn.postTestAction && Object.keys(grn.postTestAction).length > 0 && 
                JSON.stringify(grn.postTestAction) !== '{}') {
                return res.status(400).json({ status: 400, message: "Post Test Action already exists" });
                }                
                grn.postTestAction = postTest;
                break;

            case 'update':
                if (grn.postTestAction && Object.keys(grn.postTestAction).length > 0 && 
                JSON.stringify(grn.postTestAction) !== '{}') {
                    Object.assign(grn.postTestAction, postTest);
                }else{
                    return res.status(404).json({ status: 404, message: "Post Test Action not found" });
                }
               
                break;

            case 'delete':
                if (!grn.postTestAction) {
                    return res.status(404).json({ status: 404, message: "Post Test Action not found" });
                }
                grn.postTestAction = undefined;
                break;

            case 'list':
                return res.status(200).json({
                    status: 200,
                    message: "Post Test Action retrieved successfully",
                    postTestAction: grn.postTestAction || null
                });

            default:
                return res.status(400).json({ status: 400, message: "Invalid action" });
        }

        // Save the updated sample document
        await sample.save();

        return res.status(200).json({
            status: 200,
            message: `Post Test Action ${action}ed successfully`,
            postTestAction: grn.postTestAction || null
        });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};


export const managePostTestAction1 = async (req, res) => {
    try {
        const { sampleId, grnNo, action, recoveryAmount, recoveryDamage,issuedToField } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;

        // Fetch the sample document
        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status: 404, message: "Sample not found" });

        // Find the specific GRN by grnNo
        const grn = sample.grns.find(grn => grn.grnNo === grnNo);
        if (!grn) return res.status(404).json({ status: 404, message: "GRN not found" });

        const uploadedFiles = {
            uploadNotice: req.files?.["uploadNotice"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || grn.postTestAction?.uploadNotice || [],
            uploadOMFinancialPenalty: req.files?.["uploadOMFinancialPenalty"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || grn.postTestAction?.uploadOMFinancialPenalty || [],
            uploadOMDebarment: req.files?.["uploadOMDebarment"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || grn.postTestAction?.uploadOMDebarment || [],
        };

       

        switch (action) {
            case 'add':
                if (grn.postTestAction && Object.keys(grn.postTestAction).length > 0) {
                    return res.status(400).json({ status: 400, message: "Post Test Action already exists" });
                }
                grn.postTestAction = {
                    recoveryAmount,
                    recoveryDamage,
                    issuedToField,
                    sapID,
                    name,
                    uID,
                    ...uploadedFiles,
                };
                break;

                case 'update':
                    if (!grn.postTestAction) {
                        return res.status(404).json({ status: 404, message: "Post Test Action not found" });
                    }
                    // grn.postTestAction = {}
                    // Update text fields
                    if (recoveryAmount !== undefined) grn.postTestAction.recoveryAmount = recoveryAmount;
                    if (recoveryDamage !== undefined) grn.postTestAction.recoveryDamage = recoveryDamage;
                    if (issuedToField !== undefined) grn.postTestAction.issuedToField = issuedToField;
                   
                    grn.postTestAction.uploadNotice = uploadedFiles.uploadNotice.length > 0 ? uploadedFiles.uploadNotice : grn.postTestAction.uploadNotice;
                    grn.postTestAction.uploadOMFinancialPenalty = uploadedFiles.uploadOMFinancialPenalty.length > 0 ? uploadedFiles.uploadOMFinancialPenalty : grn.postTestAction.uploadOMFinancialPenalty;
                    grn.postTestAction.uploadOMDebarment = uploadedFiles.uploadOMDebarment.length > 0 ? uploadedFiles.uploadOMDebarment : grn.postTestAction.uploadOMDebarment;
                   

                    // Update file arrays
                  /*  ['uploadNotice', 'uploadOMFinancialPenalty', 'uploadOMDebarment'].forEach(key => {
                        if (uploadedFiles[key].length > 0) {
                            grn.postTestAction[key] = Array.isArray(grn.postTestAction[key])
                                ? grn.postTestAction[key].concat(uploadedFiles[key])
                                : uploadedFiles[key];
                        }
                    }); */

                    /* grn.postTestAction = {
                        recoveryAmount,
                        recoveryDamage,
                        issuedToField,
                        ...uploadedFiles,
                    }; */
                    console.log('grn.postTestAction', grn.postTestAction);
                    break;

            case 'delete':
                if (!grn.postTestAction) {
                    return res.status(404).json({ status: 404, message: "Post Test Action not found" });
                }
                grn.postTestAction = undefined;
                break;

            case 'list':
                return res.status(200).json({
                    status: 200,
                    message: "Post Test Action retrieved successfully",
                    postTestAction: grn.postTestAction || null
                });

            default:
                return res.status(400).json({ status: 400, message: "Invalid action" });
        }

        // Save the updated sample document
        await sample.save();

        return res.status(200).json({
            status: 200,
            message: `Post Test Action ${action}ed successfully`,
            postTestAction: grn.postTestAction || null
        });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};

export const managePostTestAction = async (req, res) => {
    try {
        const { sampleId, grnNo, action, recoveryAmount, recoveryDamage, issuedToField } = req.body;
        const { selectedRole,sapID,location,uID,loginPersonName } = req.encodedUser;

        // Fetch the sample document
        const sample = await sampleModel.findById(sampleId);
        if (!sample) return res.status(404).json({ status: 404, message: "Sample not found" });

        // Find the specific GRN by grnNo
        const grn = sample.grns.find(grn => grn.grnNo === grnNo);
        if (!grn) return res.status(404).json({ status: 404, message: "GRN not found" });


        const uploadedFiles = {
            uploadNotice: req.files?.["uploadNotice"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || grn.postTestAction?.uploadNotice || [],
            uploadOMFinancialPenalty: req.files?.["uploadOMFinancialPenalty"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || grn.postTestAction?.uploadOMFinancialPenalty || [],
            uploadOMDebarment: req.files?.["uploadOMDebarment"]?.map(file => path.join(UPLOAD_PATH, sampleId, file.filename)) || grn.postTestAction?.uploadOMDebarment || [],
        };


        // console.log(grn);
        // Uploaded files mapping
        switch (action) {
            case 'add':
                /* if (grn.postTestAction) {
                    return res.status(400).json({ status: 400, message: "Post Test Action already exists" });
                }*/
        
                grn.postTestAction = {
                    recoveryAmount,
                    recoveryDamage,
                    issuedToField,
                    sapID,
                    name,
                    uID,
                    ...uploadedFiles,
                };
                break;

            case 'update':
                
                /* if (!grn.postTestAction) {
                    return res.status(404).json({ status: 404, message: "Post Test Action not found" });
                }*/

                // Update fields only if they are provided in the request
                if (recoveryAmount !== undefined) grn.postTestAction.recoveryAmount = recoveryAmount;
                if (recoveryDamage !== undefined) grn.postTestAction.recoveryDamage = recoveryDamage;
                if (issuedToField !== undefined) grn.postTestAction.issuedToField = issuedToField;

                // Update file arrays only if new files are uploaded
                if (uploadedFiles.uploadNotice.length > 0) grn.postTestAction.uploadNotice = uploadedFiles.uploadNotice;
                if (uploadedFiles.uploadOMFinancialPenalty.length > 0) grn.postTestAction.uploadOMFinancialPenalty = uploadedFiles.uploadOMFinancialPenalty;
                if (uploadedFiles.uploadOMDebarment.length > 0) grn.postTestAction.uploadOMDebarment = uploadedFiles.uploadOMDebarment;
                break;

            case 'delete':
                if (!grn.postTestAction) {
                    return res.status(404).json({ status: 404, message: "Post Test Action not found" });
                }
                grn.postTestAction = undefined; // Clear the postTestAction object
                break;

            case 'list':
                return res.status(200).json({
                    status: 200,
                    message: "Post Test Action retrieved successfully",
                    postTestAction: grn.postTestAction || null
                });

            default:
                return res.status(400).json({ status: 400, message: "Invalid action" });
        }

        // Save the updated sample document
        await sample.save();

        return res.status(200).json({
            status: 200,
            message: `Post Test Action ${action}ed successfully`,
            postTestAction: grn.postTestAction || null
        });
    } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
    }
};
