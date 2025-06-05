import grnModel from '../models/grnModel.js';
import materialModel from '../models/materialModel.js';
import notificationModel from '../models/notificationModel.js';
import sampleModel from '../models/sampleModel.js';
import sampleTeamModel from '../models/samplingTeamModel.js';
import mongoose from 'mongoose';
import { sendEmail } from './emailController.js';
// Add a Team Member
export const addTeamMember = async (req, res) => {
    try {
        const { di, memberName, mobileNo, role,email,sampleID,uID } = req.body;
        const {selectedRole,sapID,location,loginPersonName} = req.encodedUser;
        
        var discom = '';
        var materialRes = await materialModel.findOne({di});
        if (materialRes){
            discom = materialRes.discom;
        }


                    
        await sampleModel.findByIdAndUpdate({di,_id:new mongoose.Types.ObjectId(sampleID) }, {
            $push: {
                teamMembers: {
                    memberName,
                    mobileNo,
                    role,
                    email
                }
            } });

       /*  const newMember = new sampleTeamModel({ di, sampleID, memberName, mobileNo, role, email, sapID, location, uID,loginPersonName });
        await newMember.save(); */

    

        var grnRecord = await grnModel.find({di});
        if (grnRecord && grnRecord.length > 0) {
            for (const record of grnRecord) {
                // Process each record here
                // console.log(`Processing GRN: ${record.storeLocation}`);
        
                var notification = {
                    di: di,
                    title: 'Team Member Added',
                    description: `A new team member, ${memberName}, has been added to the sampling team DINo ${di}, location ${record.storeLocation}`,
                    notificationFor: "AE",
                    location:record.storeLocation,
                    discom: record.discom,
                    sapID: record.sapID,
                    loginPersonName: record.loginPersonName,
                    uID: record.uID,
                    officelocation: record.location
                };
                await notificationModel.create(notification);
               
            }
        } else {
            console.log("No GRN records found for the given DI.");
        }
        
       

        return res.status(201).json({ status: 201, message: 'Team member added successfully' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error adding team member', error: error.message });
    }
};


export const notifyTeamMember = async (req, res) => {
    try {
        const { di,sampleID } = req.body;

        // Fetch all existing team members for the given DI
      /*   const sampleMembers = await sampleModel.find({ di,_id: new mongoose.Types.ObjectId(sampleID) });

        if (sampleMembers.teamMembers.length === 0) {
            return res.status(404).json({ status: 404, message: 'No team members found for this DI' });
        }
        const existingMembers = sampleMembers.teamMembers;   */
        // Fetch all samples for the DI where seal is not done
       //  const sampleRes = await sampleModel.findOne({ di, _id: new mongoose.Types.ObjectId(sampleID), sealDone: 0 }).sort({ createdAt: -1 });
     

// Find single sample document by _id and di
        const sampleMemberDoc = await sampleModel.findOne({ di, _id: new mongoose.Types.ObjectId(sampleID) });

        if (!sampleMemberDoc || sampleMemberDoc.teamMembers.length === 0) {
            return res.status(404).json({ status: 404, message: 'No team members found for this DI' });
        }

        const existingMembers = sampleMemberDoc.teamMembers;



        let selectedItemsTable = '';
        let allItems = [];

        // Flatten all items from sampleRes
        sampleMemberDoc.items.forEach(sample => {
            if (1==1) {
                allItems = allItems.concat(sample);
            }
        });

        if (allItems.length > 0) {
            selectedItemsTable = `<br><br>
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr><td colspan="5"><strong>Items Selected:</strong></td></tr>
                        <tr>
                            <th>Item ID</th>
                            <th>Material Name</th>
                            <th>GRN No</th>
                            <th>Line No</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allItems.map(item => `
                            <tr>
                                <td>${item.itemID}</td>
                                <td>${item.materialName}</td>
                                <td>${item.grnNo}</td>
                                <td>${item.Line_NO}</td>
                                <td>${item.location}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
        }

        const latestSample = sampleMemberDoc;
        const storeName = latestSample?.items?.[0]?.location || 'the store';
        let messageDetail = '';

        if (latestSample?.communicateStoreCenterSampleDetails === 1) {
            messageDetail = `This is to notify you that Sample location at ${storeName} from the DI No. ${di} has been 
                selected by quality cell for quality testing. This sample will be sealed 
                on ${latestSample.sealingDate} by sampling team. You are requested to be 
                present on the designated date and time at the above-mentioned store location to 
                seal the selected sample. If you are not present on the notified time, the sample will 
                be sealed in your absence by the rest of the team members of the Sampling Team. ${selectedItemsTable}`;
        } else {
            selectedItemsTable = '';
            messageDetail = `This is to notify you that Sample location at ${storeName} from the DI No. ${di} has been 
                selected by quality cell for quality testing. This sample will be sealed 
                on ${latestSample.sealingDate} by sampling team. Sample No. will be disclosed upon arrival of sampling team at the above store 
                location. You are requested to be present on the designated date and time at the above-mentioned store location to 
                seal the selected sample. If you are not present on the notified time, the sample will 
                be sealed in your absence by the rest of the team members of the Sampling Team.`;
        }

        // Send email to all existing members
        const sentEmails = new Set();

        for (const member of existingMembers) {
            if (!sentEmails.has(member.email)) {
                await sendEmail(
                    member.email,
                    `DI ${di} - Samples selected for sealing`,
                    `Dear ${member.memberName}, ${member.role}, <br><br> ${messageDetail}`
                );
                sentEmails.add(member.email);
            }
        }

        return res.status(200).json({ status: 200, message: 'Email sent to all existing team members' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error notifying team members', error: error.message });
    }
};



export const notifyTeamMemberOld = async (req, res) => {
    try {
        const { di } = req.body;

        // Fetch all existing team members for the given DI
        const existingMembers = await sampleTeamModel.find({ di });

        if (existingMembers.length === 0) {
            return res.status(404).json({ status: 404, message: 'No team members found for this DI' });
        }

        // Fetch the latest sample details
        const sampleRes = await sampleModel.find({ di, sealDone: 0 }).sort({ createdAt: -1 });
        var selectedItemsTable = '';
        if (sampleRes.length > 0) {
            selectedItemsTable = `<br><br>
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr><td>Items Selected are:</td></tr>
                        <tr>
                            <th>Item ID</th>
                            <th>Material Name</th>
                            <th>GRN No</th>
                            <th>Line No</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sampleRes.items.map(item => `
                            <tr>
                                <td>${item.itemID}</td>
                                <td>${item.materialName}</td>
                                <td>${item.grnNo}</td>
                                <td>${item.Line_NO}</td>
                                <td>${item.location}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
            }
            var storeName = sampleRes[0]?.items[0]?.location;
            var messageDetail = '';
            if (sampleRes[0].communicateStoreCenterSampleDetails == 1) {
                messageDetail =  `This is to notify you that Sample location at ${storeName} from the DI No. ${di} has been 
                selected by quality cell for quality testing. This sample will be sealed 
                on ${sampleRes[0].sealingDate} by sampling team. You are requested to be 
                present on the designated date and time at the above-mentioned store location to 
                seal the selected sample. If you are not present on the notified time, the sample will 
                be sealed in your absence by the rest of the team members of the Sampling Team. ${selectedItemsTable}`
            }else{
                selectedItemsTable = '';
                messageDetail =  `This is to notify you that Sample location at ${storeName} from the DI No. ${di} has been 
                selected by quality cell for quality testing. This sample will be sealed 
                on ${sampleRes[0].sealingDate} by sampling team. Sample No. will be disclosed upon arrival of sampling team at the above store 
                location.You are requested to be present on the designated date and time at the above-mentioned store location to 
                seal the selected sample. If you are not present on the notified time, the sample will 
                be sealed in your absence by the rest of the team members of the Sampling Team.`
            }

            // Send email to all existing members
            for (const member of existingMembers) {
                await sendEmail(
                    member.email,
                    `DI ${di} - Samples selected for sealing`,
                    `Dear ${member.memberName}, ${member.role}, <br><br> ${messageDetail}`
                );
            }
       

        return res.status(200).json({ status: 200, message: 'Email sent to all existing team members' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error notifying team members', error: error.message });
    }
};


// Edit a Team Member
export const editTeamMember = async (req, res) => {
    try {
        const { id } = req.body;
        const updateData = req.body;

        const updatedMember = await sampleTeamModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedMember) {
            return res.status(404).json({ status: 404, message: 'Team member not found' });
        }

        return res.status(200).json({ status: 200, message: 'Team member updated successfully', data: updatedMember });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error updating team member', error: error.message });
    }
};

// List Team Members
export const listTeamMembers = async (req, res) => {
    try {
        const { page = 1, limit = 10, di, sampleID } = req.body;

        // Fetch all existing team members for the given DI
        const sampleMemberDoc = await sampleModel.findOne({ di, _id: new mongoose.Types.ObjectId(sampleID) });

        if (!sampleMemberDoc || sampleMemberDoc.teamMembers.length === 0) {
            return res.status(404).json({ status: 404, message: 'No team members found for this DI' });
        }

        const existingMembers = sampleMemberDoc.teamMembers;

        /*

        const filter = {}
        if (di) filter.di = di;


        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
            // populate: { path: 'di', select: 'di materialName' }, // Populate `di` details from `materials`
        };

        const result = await sampleTeamModel.paginate(filter, options); */

        return res.status(200).json({
            status: 200,
            message: 'List of team members',
            data: existingMembers
           /* totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            nextPage: result.nextPage,
            prevPage: result.prevPage,
            limit: result.limit,*/
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error fetching team members', error: error.message });
    }
};

// Delete a Team Member
export const deleteTeamMember = async (req, res) => {
        
        const { id,sampleID, memberId, email } = req.body;

      
        const filter = {};
        if (memberId) filter['teamMembers._id'] = memberId;
        if (email) filter['teamMembers.email'] = email;
      
        try {
          const updatedSample = await sampleModel.findOneAndUpdate(
            { _id: sampleID, ...filter },
            {
              $pull: {
                teamMembers: memberId
                  ? { _id: memberId }
                  : { email: email }
              }
            },
            { new: true }
          );
      
          if (!updatedSample) {
            return res.status(404).json({ message: "Sample or team member not found" });
          }
      
          return res.status(200).json({
            message: "Team member removed successfully",
            data: updatedSample
          });
        } catch (error) {
          return res.status(500).json({ message: "Server error", error: error.message });
        }


     /*   const deletedMember = await sampleTeamModel.findByIdAndDelete(id);

        if (!deletedMember) {
            return res.status(404).json({ status: 404, message: 'Team member not found' });
        }

        return res.status(200).json({ status: 200, message: 'Team member deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error deleting team member', error: error.message });
    } */
};
