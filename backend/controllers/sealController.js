import sealModel from "../models/sealModel.js";
import path from "path";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from "fs";
import crypto from "crypto";
import sampleModel from "../models/sampleModel.js";
import samplingTeamModel from "../models/samplingTeamModel.js";
import notificationModel from "../models/notificationModel.js";
import materialModel from "../models/materialModel.js";
import { sendEmail } from "./emailController.js";
import grnModel from "../models/grnModel.js";
import { stringify } from 'csv-stringify';
dotenv.config();
const UPLOAD_PATH =  'https://devops1.uppcl.org/qualitycell/uploads/';


// Add a new seal
export const addSealOld = async (req, res) => {
    try {
        const { di, sealingDate, sealDetails} = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;

        let samplesSelected = [];
        const photographs = req.files["photographs"]?.map(file => path.join(UPLOAD_PATH, di, file.filename)) || [];
        const video = req.files["video"]?.map(file => path.join(UPLOAD_PATH, di, file.filename)) || [];
        samplesSelected = JSON.parse(req.body.samplesSelected);

        const newSeal = new sealModel({
            di,
            sealingDate,
            sealDetails,
            samplesSelected,
            photographs,
            video,
            sapID,
            name,
            uID
        });


        const savedSeal = await newSeal.save();
        return res.status(201).json({ status: 201, message: 'Seal added successfully', data: savedSeal });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error adding seal', error: error.message });
    }
};


export const displayMaterialSelected = async (req, res) => {
    await sampleModel.findByIdAndUpdate(req.body.sampleID, { $set: { communicateStoreCenterSampleDetails: 1 } });
    return res.status(201).json({ status: 201, message: "Updated successfully" });

}


export const requestdDisplayMaterialSelected = async (req, res) => {
    await sampleModel.findByIdAndUpdate(req.body.sampleID, { $set: { requestTocommunicate: 1 } });
    return res.status(201).json({ status: 201, message: "Updated successfully" });

}


export const addSeal = async (req, res) => {
    try {
        const { di, sealingDate, actualSealingDate, sealDetails,samples,teamMembers,sampleID,page, limit, paymentTypes } = req.body;
        const { selectedRole,sapID,location,uID,loginPersonName } = req.encodedUser;
        // Ensure di is valid
        
         var discom = "";
         var materialTag = "";
         const existingDi = await materialModel.findOne({ di });
         if (existingDi) {
           discom = existingDi.location;
           materialTag = existingDi.materialTag;
         }       
        
        
        const filter = {};
        if (sampleID) filter._id = new mongoose.Types.ObjectId(sampleID);
         const options = {
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                    sort: { createdAt: -1 },
                }; 
        
       const result = await sampleModel.paginate(filter, options);
        if (selectedRole == 'EE (STORE)' || selectedRole == 'AE (STORE)' || selectedRole == 'SE (STORE)' ) {
            if (uID) {
                // const locationRegex = new RegExp(location, 'i'); // Create regex for case-insensitive match
                result.docs = result.docs.map((doc) => {
                    const filteredItems = doc.items.filter((item) => item.uID === uID);
                    return {
                        ...doc._doc, // Spread to copy the document
                        items: filteredItems, // Replace items with filtered ones
                    };
                });
            }
            }

        // Verify UPLOAD_PATH is defined
        var items = result.docs[0].items;
        var canDispatch = result.docs[0].canDispatch;
        
        // Ensure directory for di exists
        const directoryPath = UPLOAD_PATH;
        // const directoryPath = path.join(UPLOAD_PATH, di);
        /* console.log(directoryPath);
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        } */

        // Process files
        const photographs =
            req.files["photographs"]?.map(file => path.join(directoryPath, file.filename)) || [];
        const video =
            req.files["video"]?.map(file => path.join(directoryPath, file.filename)) || [];


        
        // Parse samplesSelected safely
        var samplesSelected = [];
        if (1==1) {
            // console.log(req.body.samples);
            try {
                samplesSelected = items;
            } catch (error) {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid samplesSelected format. Must be valid JSON.",
                    error: error.message,
                });
            }
        }


        var teamMembersSelected = [];
        if (req.body.teamMembers) {
            try {
                teamMembersSelected = JSON.parse(req.body.teamMembers);
            } catch (error) {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid samplesSelected format. Must be valid JSON.",
                    error: error.message,
                });
            }
        }

        // const sealNo = `SEAL${Date.now()}${crypto.randomBytes(4).toString("hex")}`;
        const sealNo = `SEAL${crypto.randomBytes(4).toString("hex")}`;

        // Create and save the new seal
        const newSeal = new sealModel({
            di,
            sealNo,
            sealingDate,
            actualSealingDate,
            sealDetails,
            samplesSelected,
            canDispatch,
            teamMembersSelected,
            paymentTypes,
            sapID,
            location,
            uID,
            loginPersonName,
            photographs,
            video,
            discom,
            associatedTags:materialTag
        });

        const savedSeal = await newSeal.save();




        var diQuantity = 0;
        var totalQuantityRec = 0;
        var matResponse = await materialModel.findOne({di:di});
       // diQuantity = matResponse.POQuantity;
        // console.log('matResponse', matResponse.Data[0].get('Quantity'));
        matResponse.Data.forEach((item) => {
         // diQuantity += item.get('Quantity');
          diQuantity += parseInt(item.get('Quantity') || 0, 10);
        });    
        
        // console.log(diQuantity);
        var matResponse = await grnModel.find({di:di,sampleSelectedFromIt:1});
        matResponse.forEach((item) => {
          totalQuantityRec += item.quantity;
        })
    
    
        if (diQuantity ==  totalQuantityRec) {
          await materialModel.findOneAndUpdate({ di:di }, { totalQuantityReceived: 1 , receivedQuantity: totalQuantityRec });
        }else{
          await materialModel.findOneAndUpdate({ di:di }, { totalQuantityReceived: 0, receivedQuantity: totalQuantityRec });
        } 



       await sampleModel.findByIdAndUpdate(sampleID, { $set: { sealDone: 1 } });

        await Promise.all(
            teamMembersSelected.map(async (member) => {

                 if (member.email) {
                            const selectedItemsTable = `
                                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                                    <thead>
                                     <tr>
                                            <td colspan="5">DI: ${di} </td>
                                    </tr>    
                                    <tr>
                                            <td colspan="5">Seal Details: ${sealDetails} </td>
                                        </tr>
                                        <tr>
                                            <td colspan="5">Seal Date: ${sealingDate} </td>
                                        </tr>
                                        <tr>
                                            <th>Item ID</th>
                                            <th>Material Name</th>
                                            <th>GRN No</th>
                                            <th>Line No</th>
                                            <th>Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${samplesSelected.map(item => `
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
                        
                           /* sendEmail(
                                member.email,
                                `Items for DI ${di} has been sealed`,
                                `<br><br>${selectedItemsTable}`,
                                "" // Replace with actual image path if needed
                            );*/
                        }
            })
        );


        return res.status(201).json({ status: 201, message: "Seal added successfully", data: savedSeal });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Error adding seal", error: error.message });
    }
};



// Update an existing seal
export const updateSeal = async (req, res) => {
    try {

        const { id, di, sealingDate, sealDetails,samples,teamMembers  } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        
        const uploadedPhotographs = req.files["photographs"]?.map(file => path.join(UPLOAD_PATH, file.filename)) || [];
        const uploadedVideos = req.files["video"]?.map(file => path.join(UPLOAD_PATH,  file.filename)) || [];
        
        const sealingRes = await sealModel.findById(id);
        if (!sealingRes) return res.status(404).json({ status:404, message: "Seal not found" });

        // Update fields conditionally
        
        if (uploadedPhotographs.length > 0) sealingRes.photographs = uploadedPhotographs;
        if (uploadedVideos.length > 0) sealingRes.video = uploadedVideos;

        

       sealingRes.sealDetails = sealDetails;

        // Save the updated sample
        await sealingRes.save();     

        return res.status(200).json({ status: 200, message: 'Seal updated successfully', data: sealingRes });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error updating seal', error: error.message });
    }
};

// Delete a seal
export const deleteSeal = async (req, res) => {
    try {
        const { id } = req.body; // Seal ID

        const deletedSeal = await sealModel.findByIdAndDelete(id);
        if (!deletedSeal) {
            return res.status(404).json({ status: 404, message: 'Seal not found' });
        }

        return res.status(200).json({ status: 200, message: 'Seal deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error deleting seal', error: error.message });
    }
};

// List seals
export const listSeal = async (req, res) => {
    try {
        const { page = 1, limit = 10, di } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        // add filter by di
        const filter = {}
        if (di) filter.di = di;
        if (selectedRole == 'AE (STORE)' || selectedRole == 'EE (STORE)' || selectedRole == 'SE (STORE)' ) {
            filter['samplesSelected'] = { $elemMatch: { uID: uID } };
            //  filter.name = { $regex: new RegExp(name, 'i') }; 
        }
       // console.log(filter);

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }
        };

        const seals = await sealModel.paginate(filter, options);

        return res.status(200).json({
            status: 200,
            message: 'List of seals',
            data: seals.docs,
            totalDocs: seals.totalDocs,
            totalPages: seals.totalPages,
            currentPage: seals.page,
            hasNextPage: seals.hasNextPage,
            hasPrevPage: seals.hasPrevPage,
            nextPage: seals.nextPage,
            prevPage: seals.prevPage,
            limit: seals.limit
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error listing seals', error: error.message });
    }
};



export const manageFeesPayment = async (req, res) => {
    try {
        const { sealId, mode, paymentId, feesPayment } = req.body; // Get required fields from the request
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        // Validate the mode
        if (!["add", "update", "delete", "list"].includes(mode)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid mode. Allowed values: add, update, delete, list.",
            });
        }

        // Find the seal by ID
        const seal = await sealModel.findById(sealId);
        if (!seal) {
            return res.status(404).json({
                status: 404,
                message: "Seal not found.",
            });
        }

        let updatedSeal;

        switch (mode) {
            case "add": {
                if (!feesPayment) {
                    return res.status(400).json({
                        status: 400,
                        message: "feesPayment data is required for adding.",
                    });
                }
                feesPayment.sapID = sapID;
                feesPayment.uID = uID;
                feesPayment.loginPersonName = loginPersonName;
                seal.feesPayment.push(feesPayment); // Add new payment
                updatedSeal = await seal.save();
                return res.status(201).json({
                    status: 201,
                    message: "Fees payment added successfully.",
                    data: updatedSeal,
                });
            }

            case "update": {
                if (!paymentId || !feesPayment) {
                    return res.status(400).json({
                        status: 400,
                        message: "paymentId and feesPayment data are required for updating.",
                    });
                }
                const paymentIndex = seal.feesPayment.findIndex(
                    (payment) => payment._id.toString() === paymentId
                );
                if (paymentIndex === -1) {
                    return res.status(404).json({
                        status: 404,
                        message: "Payment not found.",
                    });
                }
                seal.feesPayment[paymentIndex] = {
                    ...seal.feesPayment[paymentIndex]._doc,
                    ...feesPayment, // Merge new data with existing payment
                };
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Fees payment updated successfully.",
                    data: updatedSeal,
                });
            }

            case "delete": {
                if (!paymentId) {
                    return res.status(400).json({
                        status: 400,
                        message: "paymentId is required for deleting.",
                    });
                }
                seal.feesPayment = seal.feesPayment.filter(
                    (payment) => payment._id.toString() !== paymentId
                );
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Fees payment deleted successfully.",
                    data: updatedSeal,
                });
            }

            case "list": {
                return res.status(200).json({
                    status: 200,
                    message: "Fees payment list retrieved successfully.",
                    data: seal.feesPayment,
                });
            }

            default:
                return res.status(400).json({
                    status: 400,
                    message: "Invalid mode.",
                });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error managing fees payment.",
            error: error.message,
        });
    }
};


export const manageItemsSentCheck = async (req, res) => {

    const { di } = req.body;
    const materialRes = await materialModel.findOne({ di });
    /* if (materialRes.receivedQuantity < materialRes.POQuantity && materialRes.materialTag.trim() == 'Transformer above 200 kVA' ) {
        return res.status(404).json({ status: 404, message: "Can not dispatch as all transformer not received" });
    }else{
        return res.status(200).json({ status: 200, message: "All transformer received" });
    }  */
    if ( materialRes.totalQuantityReceived != 1 && ( materialRes.materialTag.trim() == 'Transformer above 200 kVA'  || materialRes.materialTag.trim() == 'Transformer below 200 kVA'  ) ) {
        return res.status(404).json({ status: 404, message: "Can not dispatch as all transformer not received" });
    }else{
        return res.status(200).json({ status: 200, message: "All transformer received" });
    } 

}

export const selectFinalDispatchOld = async (req, res) => {
  try {
    const { sealId, checkedItemsArray } = req.body;

   if (!checkedItemsArray || !Array.isArray(checkedItemsArray) || checkedItemsArray.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "checkedItemsArray data is required and must not be empty.",
      });
    }

    const seal = await sealModel.findById(sealId);
    if (!seal) {
      return res.status(404).json({
        status: 404,
        message: "Seal not found.",
      });
    }

    let foundCount = 0;
    const notFoundIds = []; 

    for (const id of checkedItemsArray) {
      const sample = seal.samplesSelected.find(
        (sampleSS) => sampleSS._id.toString() === id
      );

      if (sample) {
        sample.sendForFinalDispatch = 1;
        foundCount++;
      } else {
        notFoundIds.push(id);
      }
    }
    // console.log(sample); 
    /* if (foundCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "No matching samples found for final dispatch.",
        notFoundIds,
      });
    } */

   const updatedSeal = await seal.save(); 

    return res.status(200).json({
      status: 200,
      message: `item(s) marked for final dispatch.`,
     // notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined,
      //data: updatedSeal,
    });
    
  } catch (error) {
    console.error("Final Dispatch Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error while updating final dispatch.",
      error: error.message,
    });
  }
};


export const selectFinalDispatch = async (req, res) => {
    try {
      const { finaldispathItems } = req.body;
  
      if (!Array.isArray(finaldispathItems) || finaldispathItems.length === 0) {
        return res.status(400).json({
          status: 400,
          message: "finaldispathItems must be a non-empty array.",
        });
      }
  
      // Group itemIDs by sealId
      const sealGroups = finaldispathItems.reduce((map, { sealId, itemID }) => {
        if (!map[sealId]) {
          map[sealId] = [];
        }
        map[sealId].push(itemID);
        return map;
      }, {});
  
      const notFoundEntries = [];
  
      // Iterate over each sealId group
      for (const [sealId, itemIDs] of Object.entries(sealGroups)) {
        const seal = await sealModel.findById(sealId);
  
        if (!seal) {
          itemIDs.forEach(itemID => {
            notFoundEntries.push({ sealId, itemID, reason: "Seal not found" });
          });
          continue;
        }
  
        const updatedSamples = seal.samplesSelected.map(sample => {
          if (itemIDs.includes(sample._id.toString())) {
            sample.sendForFinalDispatch = 1;
          }
          return sample;
        });
  
        // Check if any itemID wasn't found
        const existingIDs = seal.samplesSelected.map(s => s._id.toString());
        const missingIDs = itemIDs.filter(id => !existingIDs.includes(id));
        missingIDs.forEach(itemID => {
          notFoundEntries.push({ sealId, itemID, reason: "Sample not found" });
        });
  
        // Save updated seal
        await seal.save();
      }
  
      return res.status(200).json({
        status: 200,
        message: "Items marked for final dispatch.",
        notMarked: notFoundEntries.length > 0 ? notFoundEntries : undefined,
      });
  
    } catch (error) {
      console.error("Final Dispatch Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error while updating final dispatch.",
        error: error.message,
      });
    }
  };
  
  

export const manageItemsSent = async (req, res) => {
    try {
        const { sealId, mode, itemSentId,  checkedItemsArray, sendDate, VehicleNo } = req.body;
        const { selectedRole,sapID,location,uID,loginPersonName } = req.encodedUser;

        // Validate the mode
        if (!["add", "update", "delete", "list"].includes(mode)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid mode. Allowed values: add, update, delete, list.",
            });
        }

        // Find the seal by ID
        const seal = await sealModel.findById(sealId);
        if (!seal) {
            return res.status(404).json({
                status: 404,
                message: "Seal not found.",
            });
        }

        let updatedSeal;

        switch (mode) {
            case "add": {
                if (!checkedItemsArray) {
                    return res.status(400).json({
                        status: 400,
                        message: "checkedItemsArray data is required for adding.",
                    });
                }

                var goaHead = 1;
                if (seal.paymentTypes == 'Pre Paid'){
                    if ( seal.feesPayment.length == 0 ){
                        goaHead = 0
                    }
                }

                if (goaHead == 0){
                    return res.status(400).json({
                        status: 400,
                        message: "No pre-paid fees payment found.",
                    });
                }

                if (checkedItemsArray && checkedItemsArray.length > 0) {
                    // Iterate through checkedItemsArray to find matching items in samplesSelected
                    for (const id of checkedItemsArray) {
                        const sample = seal.samplesSelected.find(
                            (sampleSS) => sampleSS._id.toString() === id
                        );
                        console.log('bbbb', sample);
                        if (!sample) {
                            return res.status(404).json({
                                status: 404,
                                message: `Sample with itemID ${id} not found in samplesSelected.`,
                            });
                        }

                        const { _id, ...sampleDataWithoutId } = sample.toObject();   

                        // Add the sample data to itemsSent
                        seal.itemsSent.push({
                            ...sampleDataWithoutId, // Spread sample fields into itemsSent
                            sapID,
                            uID,
                            loginPersonName,
                            dateOfTransaction: sendDate, // Add transaction date
                            VehicleNo: VehicleNo, // Add vehicle number
                        });
                    }
                }

              

                updatedSeal = await seal.save();
                return res.status(201).json({
                    status: 201,
                    message: "Items sent added successfully.",
                    data: updatedSeal,
                });
            }

            case "update": {
                if (!itemSentId || !itemsSent) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemSentId and itemsSent data are required for updating.",
                    });
                }
                const itemIndex = seal.itemsSent.findIndex(
                    (item) => item._id.toString() === itemSentId
                );
                if (itemIndex === -1) {
                    return res.status(404).json({
                        status: 404,
                        message: "Item sent not found.",
                    });
                }
                seal.itemsSent[itemIndex] = {
                    ...seal.itemsSent[itemIndex]._doc,
                    ...itemsSent, // Merge updated data with existing item
                };
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Item sent updated successfully.",
                    data: updatedSeal,
                });
            }

            case "delete": {
                if (!itemSentId) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemSentId is required for deleting.",
                    });
                }
                seal.itemsSent = seal.itemsSent.filter(
                    (item) => item._id.toString() !== itemSentId
                );
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Item sent deleted successfully.",
                    data: updatedSeal,
                });
            }

            case "list": {
                return res.status(200).json({
                    status: 200,
                    message: "Items sent list retrieved successfully.",
                    data: seal.itemsSent,
                });
            }

            default:
                return res.status(400).json({
                    status: 400,
                    message: "Invalid mode.",
                });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error managing items sent.",
            error: error.message,
        });
    }
};



export const manageItemsSentOld = async (req, res) => {
    try {
        const { sealId, mode, itemSentId, itemsSent } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;

        // Validate the mode
        if (!["add", "update", "delete", "list"].includes(mode)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid mode. Allowed values: add, update, delete, list.",
            });
        }

        // Find the seal by ID
        const seal = await sealModel.findById(sealId);
        if (!seal) {
            return res.status(404).json({
                status: 404,
                message: "Seal not found.",
            });
        }

        let updatedSeal;

        switch (mode) {
            case "add": {
                if (!itemsSent) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemsSent data is required for adding.",
                    });
                }
                itemsSent.sapID = sapID;
                itemsSent.name = name;
                itemsSent.uID = uID;
                seal.itemsSent.push(itemsSent); // Add a new item sent
                updatedSeal = await seal.save();
                return res.status(201).json({
                    status: 201,
                    message: "Item sent added successfully.",
                    data: updatedSeal,
                });
            }

            case "update": {
                if (!itemSentId || !itemsSent) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemSentId and itemsSent data are required for updating.",
                    });
                }
                const itemIndex = seal.itemsSent.findIndex(
                    (item) => item._id.toString() === itemSentId
                );
                if (itemIndex === -1) {
                    return res.status(404).json({
                        status: 404,
                        message: "Item sent not found.",
                    });
                }
                seal.itemsSent[itemIndex] = {
                    ...seal.itemsSent[itemIndex]._doc,
                    ...itemsSent, // Merge updated data with existing item
                };
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Item sent updated successfully.",
                    data: updatedSeal,
                });
            }

            case "delete": {
                if (!itemSentId) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemSentId is required for deleting.",
                    });
                }
                seal.itemsSent = seal.itemsSent.filter(
                    (item) => item._id.toString() !== itemSentId
                );
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Item sent deleted successfully.",
                    data: updatedSeal,
                });
            }

            case "list": {
                return res.status(200).json({
                    status: 200,
                    message: "Items sent list retrieved successfully.",
                    data: seal.itemsSent,
                });
            }

            default:
                return res.status(400).json({
                    status: 400,
                    message: "Invalid mode.",
                });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error managing items sent.",
            error: error.message,
        });
    }
};



export const manageItemsReceive = async (req, res) => {
    try {
        const { sealId, mode, itemReceiveId,  checkedItemsArray, receiveDate } = req.body;
        const { selectedRole,sapID,location,uID,loginPersonName } = req.encodedUser;

        // Validate the mode
        if (!["add", "update", "delete", "list"].includes(mode)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid mode. Allowed values: add, update, delete, list.",
            });
        }

        // Find the seal by ID
        const seal = await sealModel.findById(sealId);
        if (!seal) {
            return res.status(404).json({
                status: 404,
                message: "Seal not found.",
            });
        }

        let updatedSeal;

        switch (mode) {
            case "add": {
                if (!checkedItemsArray) {
                    return res.status(400).json({
                        status: 400,
                        message: "checkedItemsArray data is required for adding.",
                    });
                }

                if (checkedItemsArray && checkedItemsArray.length > 0) {
                    // Iterate through checkedItemsArray to find matching items in samplesSelected
                    for (const id of checkedItemsArray) {
                        const sample = seal.itemsSent.find(
                            (sampleSS) => sampleSS._id.toString() === id
                        );

                        if (!sample) {
                            return res.status(404).json({
                                status: 404,
                                message: `Sample with itemID ${id} not found in samplesSelected.`,
                            });
                        }
                        const { _id, ...sampleDataWithoutId } = sample.toObject();
                        // Add the sample data to itemsSent
                        seal.itemsReceive.push({
                            ...sampleDataWithoutId, // Spread sample fields into itemsSent
                            sapID,
                            uID,
                            loginPersonName,
                            dateOfTransaction: receiveDate, // Add transaction date
                        });
                    }
                }

               

                updatedSeal = await seal.save();
                return res.status(201).json({
                    status: 201,
                    message: "Items received added successfully.",
                    data: updatedSeal,
                });
            }

            case "update": {
                if (!itemSentId || !itemsSent) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemSentId and itemsSent data are required for updating.",
                    });
                }
                const itemIndex = seal.itemsSent.findIndex(
                    (item) => item._id.toString() === itemSentId
                );
                if (itemIndex === -1) {
                    return res.status(404).json({
                        status: 404,
                        message: "Item sent not found.",
                    });
                }
                seal.itemsSent[itemIndex] = {
                    ...seal.itemsSent[itemIndex]._doc,
                    ...itemsSent, // Merge updated data with existing item
                };
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Item sent updated successfully.",
                    data: updatedSeal,
                });
            }

            case "delete": {
                if (!itemReceiveId) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemReceiveId is required for deleting.",
                    });
                }
                seal.itemsReceive = seal.itemsReceive.filter(
                    (item) => item._id.toString() !== itemReceiveId
                );
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Item sent deleted successfully.",
                    data: updatedSeal,
                });
            }

            case "list": {
                return res.status(200).json({
                    status: 200,
                    message: "Items sent list retrieved successfully.",
                    data: seal.itemsReceive,
                });
            }

            default:
                return res.status(400).json({
                    status: 400,
                    message: "Invalid mode.",
                });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error managing items sent.",
            error: error.message,
        });
    }
};



export const manageItemsReceiveOld = async (req, res) => {
    try {
        const { sealId, mode, itemReceiveId, checkedItemsArray } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;

        // Validate the mode
        if (!["add", "update", "delete", "list"].includes(mode)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid mode. Allowed values: add, update, delete, list.",
            });
        }

        // Find the seal by ID
        const seal = await sealModel.findById(sealId);
        if (!seal) {
            return res.status(404).json({
                status: 404,
                message: "Seal not found.",
            });
        }

        let updatedSeal;

        switch (mode) {
            case "add": {
                if (!itemsReceive) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemsReceive data is required for adding.",
                    });
                }
                itemsReceive.sapID = sapID;
                itemsReceive.name = name;
                itemsReceive.uID = uID;

                seal.itemsReceive.push(itemsReceive); // Add a new item sent
                updatedSeal = await seal.save();
                return res.status(201).json({
                    status: 201,
                    message: "Item receive added successfully.",
                    data: updatedSeal,
                });
            }

            case "update": {
                if (!itemReceiveId || !itemsReceive) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemReceiveId and itemsReceive data are required for updating.",
                    });
                }
                const itemIndex = seal.itemsReceive.findIndex(
                    (item) => item._id.toString() === itemReceiveId
                );
                if (itemIndex === -1) {
                    return res.status(404).json({
                        status: 404,
                        message: "Item receive not found.",
                    });
                }
                seal.itemsReceive[itemIndex] = {
                    ...seal.itemsReceive[itemIndex]._doc,
                    ...itemsReceive, // Merge updated data with existing item
                };
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Item receive updated successfully.",
                    data: updatedSeal,
                });
            }

            case "delete": {
                if (!itemReceiveId) {
                    return res.status(400).json({
                        status: 400,
                        message: "itemReceiveId is required for deleting.",
                    });
                }
                seal.itemsReceive = seal.itemsReceive.filter(
                    (item) => item._id.toString() !== itemReceiveId
                );
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Item receive deleted successfully.",
                    data: updatedSeal,
                });
            }

            case "list": {
                return res.status(200).json({
                    status: 200,
                    message: "Items receive list retrieved successfully.",
                    data: seal.itemsReceive,
                });
            }

            default:
                return res.status(400).json({
                    status: 400,
                    message: "Invalid mode.",
                });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error managing items sent.",
            error: error.message,
        });
    }
};



export const manageTestResults = async (req, res) => {
    try {
        const { sealId, mode, testResultId, testResult } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        // Validate mode
        if (!["add", "edit", "delete", "list"].includes(mode)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid mode. Allowed values: add, edit, delete, list.",
            });
        }

        // Find the seal by ID
        const seal = await sealModel.findById(sealId);
        if (!seal) {
            return res.status(404).json({
                status: 404,
                message: "Seal not found.",
            });
        }

        let updatedSeal;

        switch (mode) {
            case "add": {
                if (!testResult) {
                    return res.status(400).json({
                        status: 400,
                        message: "Test result data is required for adding.",
                    });
                }
                testResult.sapID = sapID;
                // testResult.location = location;
                testResult.uID = uID;
                testResult.loginPersonName = loginPersonName;
                seal.testResults.push(testResult); // Add a new test result
                updatedSeal = await seal.save();


                /* const testResultsSummary = seal.samplesSelected
                .map(sample => `Material: ${sample.materialName}, Test Result: ${sample.testResult}`)
                .join("; "); // Separate multiple results with semicolons
            
                await notificationModel.create({
                    title: `Test Result for ${seal.di}`,
                    description: `Test Results for ${seal.di}: ${testResult}`,
                    di: seal.di,
                    materialName: '', // Keeping empty since multiple materials exist
                    grnNo: '', // Keeping empty since multiple GRNs exist
                    location: '', // Keeping empty since multiple locations exist
                    notificationFor: "MMU",
                    sapID: seal.sapID,
                    officelocation: seal.location,
                    uID: seal.uID, // Assuming single UID for DI
                    loginPersonName: seal.loginPersonName,
                    discom: seal.discom,
                }); */
               
               
               


                return res.status(201).json({
                    status: 201,
                    message: "Test result added successfully.",
                    data: updatedSeal,
                });
            }

            case "edit": {
                if (!testResultId || !testResult) {
                    return res.status(400).json({
                        status: 400,
                        message: "testResultId and testResult data are required for editing.",
                    });
                }
                const testIndex = seal.testResults.findIndex(
                    (result) => result._id.toString() === testResultId
                );
                if (testIndex === -1) {
                    return res.status(404).json({
                        status: 404,
                        message: "Test result not found.",
                    });
                }
                seal.testResults[testIndex] = {
                    ...seal.testResults[testIndex]._doc,
                    ...testResult, // Merge updated data with existing test result
                };
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Test result updated successfully.",
                    data: updatedSeal,
                });
            }

            case "delete": {
                if (!testResultId) {
                    return res.status(400).json({
                        status: 400,
                        message: "testResultId is required for deleting.",
                    });
                }
                seal.testResults = seal.testResults.filter(
                    (result) => result._id.toString() !== testResultId
                );
                updatedSeal = await seal.save();
                return res.status(200).json({
                    status: 200,
                    message: "Test result deleted successfully.",
                    data: updatedSeal,
                });
            }

            case "list": {
                return res.status(200).json({
                    status: 200,
                    message: "Test results retrieved successfully.",
                    data: seal.testResults,
                });
            }

            default:
                return res.status(400).json({
                    status: 400,
                    message: "Invalid mode.",
                });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error managing test results.",
            error: error.message,
        });
    }
};


export const updateTestResultsForSamples = async (req, res) => {
    try {
        const { sealId, updates } = req.body;
        const { selectedRole, sapID, location, uID, loginPersonName } = req.encodedUser;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Updates must be a non-empty array of { itemID, testResult, description }.",
            });
        }

        const seal = await sealModel.findById(sealId);
        if (!seal) {
            return res.status(404).json({
                status: 404,
                message: "Seal not found.",
            });
        }

        let finalResult = 'Pass';

        // Group updates by itemID so we can push multiple test results
        const grouped = {};
        updates.forEach(async ({ itemID, testResult, testName, description, labName }) => {
            /* if (!grouped[itemID]) grouped[itemID] = [];
            grouped[itemID].push({ testResult, description }); */


            await seal.testResults.push({
                sapID,
                uID,
                loginPersonName,
                result: testResult,
                testDate: new Date(),
                notes: description,
                testName: testName,
                labName:labName
            });
    

        });

        // Apply the updates to samplesSelected
        /* for (const sample of seal.samplesSelected) {
            if (grouped[sample.itemID]) {
                grouped[sample.itemID].forEach(({ testResult, description }) => {
                    // Append test results and description (can be changed if replacing is needed)
                    if (!sample.testResult) sample.testResult = testResult;
                    else sample.testResult += `, ${testResult}`;
                    
                    if (!sample.description) sample.description = description;
                    else sample.description += `, ${description}`;

                    if (testResult === 'Fail') {
                        finalResult = 'Fail';
                    }
                });
            }
        } */

        // Add to testResults array
       
        await seal.save(); // Save only once

       /*  const testResultsSummary = seal.samplesSelected
            .map(sample => `Item: ${sample.itemID}, Material: ${sample.materialName}, Test Result: ${sample.testResult}`)
            .join("; ");

        await notificationModel.create({
            title: `Test Result for ${seal.di}`,
            description: `Test Results for ${seal.di}: ${testResultsSummary}`,
            di: seal.di,
            materialName: '',
            grnNo: '',
            location: '',
            notificationFor: "MMU",
            sapID: seal.sapID,
            officelocation: seal.location,
            uID: seal.uID,
            loginPersonName: seal.loginPersonName,
            discom: seal.discom,
        });

        const matRes = await materialModel.findOne({ di: seal.di });
        const recipient = matRes?.Supplier_email;

        if (recipient) {
            const selectedItemsTable = `
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th>Item ID</th>
                            <th>Material Name</th>
                            <th>GRN No</th>
                            <th>Line No</th>
                            <th>Location</th>
                            <th>Test</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${seal.samplesSelected.map(item => `
                            <tr>
                                <td>${item.itemID}</td>
                                <td>${item.materialName}</td>
                                <td>${item.grnNo}</td>
                                <td>${item.Line_NO}</td>
                                <td>${item.location}</td>
                                <td>${item.testResult}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;

            sendEmail(
                recipient,
                `DI ${seal.di} test results`,
                `<br><br>${selectedItemsTable}`,
                ""
            );
        } */

        return res.status(200).json({
            status: 200,
            message: "Test results updated successfully.",
            data: seal.samplesSelected,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error updating test results for samples.",
            error: error.message,
        });
    }
};



export const updateTestResultsForSamplesOld = async (req, res) => {
    try {
        const { sealId, updates } = req.body; // `updates` should be an array of { itemID, testResult }
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Updates must be a non-empty array of { itemID, testResult }.",
            });
        }

        // Find the seal by ID
        const seal = await sealModel.findById(sealId);
        if (!seal) {
            return res.status(404).json({
                status: 404,
                message: "Seal not found.",
            });
        }

        var finalResult = 'Pass';
        // Update `testResult` for matching `itemID` in `samplesSelected`
        updates.forEach(async ({ itemID, testResult, description }) => {
            const sample = seal.samplesSelected.find(sample => sample.itemID === itemID);
            if (sample) {
                seal.testResult = testResult; // Update the testResult field
                seal.description = description;
                /* if (testResult == 'Fail'){
                    finalResult = 'Fail';
                } */
            }

            await seal.save();
        });

        // Save the updated document
        // const updatedSeal = await seal.save();

        var ftestResult = {}
       
        ftestResult.sapID = sapID;
        // ftestResult.location = location;
        ftestResult.uID = uID;
        ftestResult.loginPersonName = loginPersonName;
        ftestResult.result = finalResult;
        ftestResult.testDate = new Date();
        ftestResult.notes = 'final test result';
        // Add a new test result to testResults array of seal
        seal.testResults.push(ftestResult); // Add a new test result
        await seal.save();


        const testResultsSummary = seal.samplesSelected
        .map(sample => `Item: ${sample.itemID}, Material: ${sample.materialName}, Test Result: ${sample.testResult}`)
        .join("; "); // Separate multiple results with semicolons
    
        await notificationModel.create({
            title: `Test Result for ${seal.di}`,
            description: `Test Results for ${seal.di}: ${testResultsSummary}`,
            di: seal.di,
            materialName: '', // Keeping empty since multiple materials exist
            grnNo: '', // Keeping empty since multiple GRNs exist
            location: '', // Keeping empty since multiple locations exist
            notificationFor: "MMU",
            sapID: seal.sapID,
            officelocation: seal.location,
            uID: seal.uID, // Assuming single UID for DI
            loginPersonName: seal.loginPersonName,
            discom: seal.discom,
        }); 
       
       
       var matRes = await materialModel.findOne({di:seal.di});
             var recipient = matRes.Supplier_email;
             if (recipient) {
                 const selectedItemsTable = `
                     <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                         <thead>
                             <tr>
                                 <th>Item ID</th>
                                 <th>Material Name</th>
                                 <th>GRN No</th>
                                 <th>Line No</th>
                                 <th>Location</th>
                                 <th>Test</th>
                             </tr>
                         </thead>
                         <tbody>
                             ${seal.samplesSelected.map(item => `
                                 <tr>
                                     <td>${item.itemID}</td>
                                     <td>${item.materialName}</td>
                                     <td>${item.grnNo}</td>
                                     <td>${item.Line_NO}</td>
                                     <td>${item.location}</td>
                                     <td>${item.testResult}</td>
                                 </tr>
                             `).join('')}
                         </tbody>
                     </table>`;
             
                 sendEmail(
                     recipient,
                     `DI ${seal.di} test results`,
                     `<br><br>${selectedItemsTable}`,
                     "" // Replace with actual image path if needed
                 );
             }
             
               



        return res.status(200).json({
            status: 200,
            message: "Test results updated successfully.",
            data: updatedSeal.samplesSelected,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Error updating test results for samples.",
            error: error.message,
        });
    }
};


export const getMaterialSamplingReport = async (req, res) => {
  try {
    const {
      materialTag,
      di,
      samplingStatus,
      teamMember, // sampling team filter
    } = req.body;

    // Step 1: Fetch materials with optional filters
    const materialFilter = {};
    if (materialTag) materialFilter.materialTag = materialTag;
    if (di) materialFilter.di = di;

    const materials = await materialModel.find(materialFilter).lean();

    const report = [];

    for (const material of materials) {
      const materialDI = material.di;

      // Total Received Quantity from GRN
      const grns = await grnModel.find({ di: materialDI }).lean();
      const receivedQuantity = grns.reduce((sum, g) => sum + (g.quantity || 0), 0);

      // Sampled Quantity from Sample Model
      const samples = await sampleModel.find({ di: materialDI }).lean();
      /* const sampledQuantity = samples.reduce((sum, s) => {
        return sum + s.items.reduce((innerSum, item) => innerSum + (item.finalSample || 0), 0);
      }, 0); */

    const sampledQuantity = samples.reduce((sum, s) => sum + (s.items?.length || 0), 0);


      // Filter by sampling team if provided
      if (teamMember) {
        const hasTeam = sampleModel.some(s => 
          s.teamMembers.some(t => 
            t.memberName?.toLowerCase().includes(teamMember.toLowerCase())
          )
        );
        if (!hasTeam) continue;
      }

      // Sampling Status
      let status = "Not Started";
      if (sampledQuantity == 0){
        status = "Not Started";
      }
      else if (material.totalQuantityReceived == 1 && material.receivedQuantity > 0) {
        status = "Complete";
      } else if (material.totalQuantityReceived == 0 && material.receivedQuantity > 0) {
        status = "In progress";
      } else {
        status = "Pending";
      }

      // Filter by sampling status if applied
      if (samplingStatus && samplingStatus !== "Select All" && samplingStatus !== status) continue;

      // Seal Details
     const sealDetailsList = await sealModel.find({ di: materialDI }).lean();

    const allItemsSent = sealDetailsList.flatMap(s => s.itemsSent || []);
    const allItemsReceive = sealDetailsList.flatMap(s => s.itemsReceive || []);
    const allItemsFeePay = sealDetailsList.flatMap(s => s.feesPayment || []);
    const allItemstest = sealDetailsList.flatMap(s => s.testResults || []);


    const DITotalQuantity = material.Data?.reduce((sum, item) => {
    const qty = item?.['Quantity'] || 0;
    return sum + parseInt(qty);
    }, 0) || 0;

      // Construct Report Row
      /* report.push({
        DISCOM:  material.discom,
        Material: material.Data?.[0]?.['Material_Name'] || '',
        DI: materialDI,
        DITotalQuantity: DITotalQuantity,
        ReceivedTotalQuantity: receivedQuantity,
        SampledQuantity: sampledQuantity,
        SamplingStatus: status,
        LocationOfSample: material.Data?.[0]?.['Plant Name'] || '',
        SealDetails: {
          sealNo: sealDetails?.sealNo || '',
          sealingDate: sealDetails?.sealingDate,
          teamMembersSelected: sealDetails?.teamMembersSelected || [],
          video: sealDetails?.video || [],
          photographs: sealDetails?.photographs || [],
          feesPayment: sealDetails?.feesPayment || [],
          itemsSent: sealDetails?.itemsSent || [],
          itemsReceive: sealDetails?.itemsReceive || [],
        },
        PostATRResult: material.postTestAction || {},
      }); */


        report.push({
        DISCOM: material.location,
        Material: material.Data?.[0]?.['Material_Name'] || '',
        DI: materialDI,
        'DI Quantity': DITotalQuantity,
        'Received Quantity': receivedQuantity,
        'Sampled Quantity': sampledQuantity,
        'Sampling Status': status,
        'Sample No.': samples.map(s => s.sampleNo).join(', ') || '',
        'Location of Sample': material.Data?.[0]?.['Plant Name'] || '',
        // 'Seal Details': (sealDetailsList || []).map(s => s.sealNo).filter(Boolean).join(', '),
        'Seal Details': (sealDetailsList || [])
        .filter(s => s.sealNo)
        .map(s => {
            const sealNo = s.sealNo;
            const sealDate = s.sealingDate ? new Date(s.sealingDate).toLocaleDateString() : 'N/A';
            const teamMembers = (s.teamMembersSelected || [])
            .map(member => member.memberName)
            .filter(Boolean)
            .join(', ') || 'N/A';
            return `SealNo: ${sealNo}, Date: ${sealDate}, Team: ${teamMembers}`;
        })
        .join(' | '),
        'Seal Attachment': (sealDetailsList || []).map(s => s.photographs).filter(Boolean).join(', '),
        'Testing Fee': allItemsFeePay.map(fee => fee.billAmount || 'N/A').join(', '),
        'Dispatch Details': allItemsSent.map(item => item.itemID || 'N/A').join(', ') ,
        'Sample Received back': allItemsReceive.map(item => item.itemID || 'N/A').join(', ') ,
        'Vehicle No.': allItemsSent.map(item => item.VehicleNo || 'N/A').join(', ') ,
        'Test Summary': material.postTestAction.finalResult || '',
        'Test failed': allItemstest
        .filter(item => item.result?.toLowerCase() === 'failed')
        .map(item => item.testName || 'N/A')
        .join(', '),
        'Test passed': allItemstest
        .filter(item => item.result?.toLowerCase() === 'pass')
        .map(item => item.testName || 'N/A')
        .join(', '),
        'Post Test ATR Filled': material.postTestAction ? 'Yes' : 'No',
        'Notice Issued to firm': material.postTestAction.noticeIssued ? 'Yes' : 'No',
        'Financial Penalty Imposed': material.postTestAction.financialPenalty ? 'Yes' : 'No',
        'Financial Penalty Amount':  material.postTestAction.imposedAmount,
        'Blacklisting': material.postTestAction.firmBlacklisted ? 'Yes' : 'No',
        });


    }


    if (req.body.export == 1) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=material_sampling_report.csv');

    const columns = Object.keys(report[0] || {}); // Derive columns from first object

    stringify(report, { header: true, columns }, (err, output) => {
        if (err) {
        console.error('CSV export error:', err);
        return res.status(500).json({ success: false, message: 'CSV export failed' });
        }
        res.send(output);
    });

    return;
    }


    return res.status(200).json({ success: true, data: report });

  } catch (err) {
    console.error("Error in getMaterialSamplingReport:", err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};