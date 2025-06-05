

import sampleModel from '../models/sampleModel.js';
import grnModel from '../models/grnModel.js';
import mongoose from 'mongoose'; 
import notificationModel from '../models/notificationModel.js';
import materialModel from '../models/materialModel.js';
import { sendEmail } from './emailController.js';
import crypto from 'crypto';
import preSampleModel from '../models/preSampleModel.js';

// Create Samples Randomly

export const showToUQCController = async (req, res) => {
    try {
        const { di, checkedItems,  suppliedQtyAgainstPOTillDate, remainingQtyToBeDelivered, additionalTestRequired, additionalTestName, uniqueSampleNo } = req.body;
       // const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        if (!di) {
            return res.status(400).json({ status: 400, message: 'Missing required fields' });
        }

        if (!checkedItems || checkedItems.length === 0) {
            return res.status(400).json({ status: 400, error: "No items selected" });
        }


        const idFilter = checkedItems.map(item => item.id);

        // Fetch GRNs associated with the selected DI and matching IDs
        const grns = await grnModel.updateMany(
            {
                di, // Ensure the DI matches
                _id: { $in: idFilter }, // Match any of the selected IDs
            },
            { $set: { showToUQC: 1, suppliedQtyAgainstPOTillDate, remainingQtyToBeDelivered, additionalTestRequired, additionalTestName, uniqueSampleNo } }
        );

        await Promise.all(
            checkedItems.map(async (item) => {

                const grnRes = await grnModel.findById(item.id);

                await notificationModel.create({
                    title: "New GRN Added",
                    description: `A new GRN No. ${grnRes.grnNo} has been added for DI ${grnRes.di}, Line_NO ${grnRes.Line_NO}, Material ${grnRes.materialName}, Location ${grnRes.storeLocation}.`,
                    di: grnRes.di,
                    materialName: grnRes.materialName,
                    grnNo: grnRes.grnNo,
                    location: grnRes.storeLocation,
                    notificationFor: "UQC",
                    sapID: grnRes.sapID,
                    officelocation: grnRes.location,
                    uID: grnRes.uID,
                    loginPersonName: grnRes.loginPersonName,
                    discom: grnRes.discom,
                });
            })
        );

        return res.status(200).json({ status: 200, message: 'Record updated Successfully' });


    } catch (error) {
        return res.status(500).json({ status:500, error: error.message });
    }    
};

// Seeded random function (for deterministic selection)


// Function to shuffle array using a seed


// Function to select random items based on seed
// Function to shuffle an array using a seed
function shuffleArrayOld(array, seed) {
    const random = crypto.createHash('sha256').update(seed.toString()).digest('hex');
    let shuffled = [...array];
    let randIndex, temp;
    for (let i = shuffled.length - 1; i > 0; i--) {
        randIndex = parseInt(random.substr(i, 2), 16) % (i + 1);
        temp = shuffled[i];
        shuffled[i] = shuffled[randIndex];
        shuffled[randIndex] = temp;
    }
    return shuffled;
}

function seededRandomGenerator(seed) {
    let h = typeof seed === 'string'
        ? Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
        : seed;
    return function () {
        h += 0x6D2B79F5;
        let t = Math.imul(h ^ h >>> 15, 1 | h);
        t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function shuffleArray(array, seed) {
    const random = seededRandomGenerator(seed);
    let shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const randIndex = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[randIndex]] = [shuffled[randIndex], shuffled[i]];
    }

    return shuffled;
}


// Function to select random items
function selectRandomItems(items, seed, count ) {
    if (items.length <= count) return items; // Return all if count exceeds available items
    const shuffledItems = shuffleArray(items, seed);
    return shuffledItems.slice(0, count);
}


export const preSampleSelect = async (req, res) => {
    try {
        const { action } = req.body;
    
        // common data from token
        const { selectedRole, sapID, location, uID, loginPersonName } = req.encodedUser;
    
        // ADD functionality
        if (action === 'add') {
          const { di, checkedItems, numOfSamples, sealingDate, sealDetails, associatedTags } = req.body;
    
          if (!di || !numOfSamples || !sealingDate || !checkedItems || checkedItems.length === 0) {
            return res.status(400).json({ status: 400, message: 'Missing required fields or checked items' });
          }
    
          const grnSelected = checkedItems.map(item => ({ id: item }));
    
          const newEntry = await preSampleModel.create({
            di,
            grnSelected,
            noOfSamples: numOfSamples,
            sealingDate,
            sealDetails,
            associatedTags,
            sapID,
            location,
            uID,
            loginPersonName
          });
    
          return res.status(201).json({ status: 201, message: 'Pre-sample added successfully', data: newEntry });
        }
    
        // DELETE functionality
        if (action === 'delete') {
          const { id } = req.body;
          if (!id) return res.status(400).json({ status: 400, message: 'Missing pre-sample ID to delete' });
    
          const deleted = await preSampleModel.findByIdAndDelete(id);
          if (!deleted) {
            return res.status(404).json({ status: 404, message: 'Pre-sample not found' });
          }
    
          return res.status(200).json({ status: 200, message: 'Pre-sample deleted successfully' });
        }
    
        // LIST functionality
        if (action === 'list') {
          const { di, page = 1, limit = 10 } = req.body;
    
          const filter = {};
          filter.sampleSelectionDone = 0; // Only show pre-samples that are not yet selected
          if (di) filter.di = di;
         // if (sapID) filter.sapID = sapID; // optional role-based filter
          const result = await preSampleModel.paginate(filter, {
            page,
            limit,
            sort: { createdAt: -1 }
          });
    
          return res.status(200).json({ status: 200, data: result });
        }
    
        return res.status(400).json({ status: 400, message: 'Invalid or missing action parameter (add, delete, list)' });
    
      } catch (error) {
        return res.status(500).json({ status: 500, error: error.message });
      }
}

export const createSamples = async (req, res) => {
    try {
        var { di, preSampleID, checkedItems, numOfSamples, sealingDate, sealDetails, teamMembers, additionalTestRequired, communicateStoreCenterSampleDetails, additionalTestName, uniqueSampleNo } = req.body;
        const { selectedRole, sapID, location, uID, loginPersonName } = req.encodedUser;
        var frozenSample = 0;

        var preSampRes = await preSampleModel.findById(preSampleID);
        if (preSampRes) {
            checkedItems = preSampRes.grnSelected;
            numOfSamples = preSampRes.noOfSamples;
            sealingDate = preSampRes.sealingDate;
            sealDetails = preSampRes.sealDetails;
        }
        
        if (!di || !numOfSamples ) {
            return res.status(400).json({ status: 400, message: 'Missing required fields' });
        }


        var matRes = await materialModel.findOne({ di: di });
        var canDispatch = 1;
        if (matRes.materialTag.trim() == 'Transformer above 200 kVA' || matRes.materialTag.trim() == 'Transformer below 200 kVA') {
            canDispatch = 0;
        }

        if (req.body.frommultiplesample){
            canDispatch = 1;

        }else{

        if (!checkedItems || checkedItems.length === 0) {
            return res.status(400).json({ status: 400, error: "No items selected" });
        }

        // Fetch GRNs associated with the selected DI and matching IDs
        const idFilter = checkedItems.map(item => item.id);

       
        const grns = await grnModel.find({ di, _id: { $in: idFilter } });

        if (!grns.length) {
            return res.status(404).json({ status: 404, message: 'No GRNs found for the selected DI' });
        }

        var expandedItems = [];

        for (const grn of grns) {
            // Validate received quantity
            const receivedQuantity =
                (Array.isArray(grn.receiveMaterailList) ? grn.receiveMaterailList.length : 0) +
                (Array.isArray(grn.customReceivedMaterial) 
                    ? grn.customReceivedMaterial.reduce((sum, mat) => sum + (parseInt(mat.quantity) || 0), 0) 
                    : 0
                );

                if (grn.quantity !== grn.totalQuantityLineNo) {
                    frozenSample = 1;
                }    
            if (grn.quantity !== receivedQuantity) {
                return res.status(400).json({
                    status: 400,
                    message: `Received Quantity and received items do not match for GRN ${grn.grnNo}`,
                });
            }

            // Process `receiveMaterailList`
            grn.receiveMaterailList.forEach(material => {
                const item = {
                    itemID: material.Serial_NO,
                    materialName: grn.materialName,
                    grnNo: grn.grnNo,
                    location: grn.plantName,
                    uID: grn.uID,
                    discom: grn.discom,
                    testToPerform: grn.associatedTests,
                    inLabs: grn.associatedLabs,
                    Line_NO: grn.Line_NO
                };
            
                if (canDispatch == 1) {
                    item.finalSample = 1;
                }
            
                expandedItems.push(item);
            });
            

            // Process `customReceivedMaterial` based on `quantity`
            grn.customReceivedMaterial.forEach(material => {
                const qty = parseInt(material.quantity) || 0;
                for (let i = 0; i < qty; i++) {
                    expandedItems.push({
                        itemID: `${material.name}-${i + 1}`,
                        materialName: grn.materialName,
                        grnNo: grn.grnNo,
                        location: grn.plantName,
                        uID: grn.uID,
                        discom: grn.discom,
                        testToPerform: grn.associatedTests,
                        inLabs: grn.associatedLabs,
                        Line_NO: grn.Line_NO,
                    });
                }
            });
        }

        if (expandedItems.length < numOfSamples) {
            return res.status(400).json({ status: 400, message: 'Insufficient items for the requested sample size' });
        }

        await grnModel.updateMany({ di, _id: { $in: idFilter } }, { $set: { sampleSelectedFromIt: 1 } });


        var diQuantity = 0;
        var totalQuantityRec = 0;
        var matResponse = await materialModel.findOne({di:di});
       // diQuantity = matResponse.POQuantity;
        var associatedTags = matResponse.materialTag;
        // console.log('matResponse', matResponse.Data[0].get('Quantity'));
        matResponse.Data.forEach((item) => {
          diQuantity += parseInt(item.get('Quantity') || 0, 10);
        });   
        
        var matResponse = await grnModel.find({di:di,sampleSelectedFromIt:1});
        matResponse.forEach((item) => {
          totalQuantityRec += item.quantity;
        })
    
    
        if (diQuantity ==  totalQuantityRec) {
         await materialModel.findOneAndUpdate({ di:di }, { totalQuantityReceived: 1 , receivedQuantity: totalQuantityRec });
        }else{
         await materialModel.findOneAndUpdate({ di:di }, { totalQuantityReceived: 0, receivedQuantity: totalQuantityRec });
        } 

       
         }
        var selectedItems = [];
        const seed = 1234;
        var checkedSamplesItems  = req.body.checkedSamplesItems;
       

        /* if (req.body.manual) {
            // If manual selection is required, use the provided checkedItems instead of random selection
            selectedItems = checkedSamplesItems.map(async item => {
                const {grnNo, Serial_NO } = item;
                const grn = await grnModel.findById(grnNo);
                // console.log(grn.plantName,grn.materialName,grn.grnNo,grn.Line_NO);
                return {
                    itemID: Serial_NO,
                    materialName: grn.materialName,
                    grnNo: grn.grnNo,
                    location: grn.plantName,
                    uID: grn.uID,
                    discom: grn.discom,
                    testToPerform: grn.associatedTests,
                    inLabs: grn.associatedLabs,
                    Line_NO: grn.Line_NO
                };
            });
        }else{
            selectedItems = selectRandomItems(expandedItems, seed, numOfSamples);
        } */
        if (req.body.frommultiplesample){
            // If manual selection is required, use the provided checkedItems instead of random selection
            var sampleres = await sampleModel.find({di:di});
            var checkedSamplesItemsA = [];
            sampleres.forEach((item) => {
                item.items.forEach((item1) => {
                    const modItem = JSON.parse(JSON.stringify(item1));
                    if(additionalTestRequired == 'yes'){
                        console.log('additionalTestRequired',additionalTestRequired);
                        modItem.additionalTestRequired = additionalTestRequired;
                        modItem.testName = 'Lightening Impulse Voltage Withstand Test and Short Circuit Withstand (Thermal and Dynamic Ability) Test';
                    }
                    modItem.finalSample = 1;
                    // console.log(modItem);
                    checkedSamplesItemsA.push(modItem);
                })
            });
            // console.log(checkedSamplesItemsA);
            selectedItems = selectRandomItems(checkedSamplesItemsA, seed, numOfSamples);
            // console.log(selectedItems);
            
                await sampleModel.updateMany(
                { di: di },
                {
                    $set: {
                    'items.$[].finalSample': 0,
                    }
                }
                );


              

            for (const item of selectedItems) {
                await sampleModel.updateOne(
                  { di: di, 'items.itemID': item.itemID },
                  {
                    $set: {
                      'items.$.finalSample': item.finalSample,
                      'items.$.additionalTestRequired': item.additionalTestRequired,
                      'items.$.testName': item.testName
                    }
                  }
                );
              }
        }
        else if (req.body.manual) {
            // If manual selection is required, use the provided checkedItems instead of random selection
            selectedItems = await Promise.all(checkedSamplesItems.map(async item => {
                const { grnNo, Serial_NO } = item;
                const grn = await grnModel.findById(grnNo);
        
                const sampleItem = {
                    itemID: Serial_NO,
                    materialName: grn.materialName,
                    grnNo: grn.grnNo,
                    location: grn.plantName,
                    uID: grn.uID,
                    discom: grn.discom,
                    testToPerform: grn.associatedTests,
                    inLabs: grn.associatedLabs,
                    Line_NO: grn.Line_NO
                };
        
                if (canDispatch == 1) {
                    sampleItem.finalSample = 1;
                }
        
                return sampleItem;
            }));
        } else {
            selectedItems = selectRandomItems(expandedItems, seed, numOfSamples);
        }
        


        const role = 'firm';
        var team = { memberName:matRes.Name_of_the_Firm, mobileNo:matRes.Supplier_Mobile_No, role, email:matRes.Supplier_email };


       // console.log(selectedItems);
        // Save new sample

        if (req.body.frommultiplesample == 1 ){

        }else{

        const samplingGroupID = `sample${crypto.randomBytes(4).toString("hex")}`;

        // Group selectedItems by uID
        const groupedItems = selectedItems.reduce((acc, item) => {
            if (!acc[item.uID]) acc[item.uID] = [];
            acc[item.uID].push(item);
            return acc;
        }, {});

    // Insert one sample per uID group
        const insertedSamples = [];
        // console.log('groupedItems', groupedItems);
        for (const uID in groupedItems) {
            const newSample = new sampleModel({
                di,
                samplingGroupID,
                sealingDate,
                sealDetails,
                teamMembers: [team],
                items: groupedItems[uID],
                additionalTestRequired,
                additionalTestName,
                uniqueSampleNo, // Optional: you may want to generate a unique number per insert if needed
                communicateStoreCenterSampleDetails,
                sapID,
                location,
                uID,
                loginPersonName,
                associatedTags,
                canDispatch
            });

            const savedDoc = await newSample.save();
            insertedSamples.push(savedDoc);
        }


        /* var newSample = new sampleModel({
            di,
            samplingGroup:
            sealingDate,
            sealDetails,
            teamMembers: [team],
            items: selectedItems,
            additionalTestRequired,
            additionalTestName,
            uniqueSampleNo,
            communicateStoreCenterSampleDetails,
            sapID,
            location,
            uID,
            loginPersonName,
            associatedTags:associatedTags,
            canDispatch:canDispatch
        });

        await newSample.save(); */

        }

        await preSampleModel.findByIdAndUpdate(preSampleID, { sampleSelectionDone: 1 });


        if (diQuantity === totalQuantityRec) {
            // const count = await sampleModel.countDocuments({ di });
           
            const samplingGroups = await sampleModel.aggregate([
            { $match: { di } }, // filter by di
            {
                $group: {
                _id: "$samplingGroupID",
                count: { $sum: 1 },
                },
            },
            ]);         
                        

            if (samplingGroups.length === 1 ) {
                await sampleModel.findOneAndUpdate({ di }, { canDispatch: 1 });



            // If manual selection is required, use the provided checkedItems instead of random selection
            var sampleresA = await sampleModel.find({di:di});
            var checkedSamplesItemsAB = [];
            sampleresA.forEach((item) => {
                item.items.forEach((item1) => {
                    const modItem = JSON.parse(JSON.stringify(item1));
                    if(additionalTestRequired == 'yes'){
                        console.log('additionalTestRequired',additionalTestRequired);
                        modItem.additionalTestRequired = additionalTestRequired;
                        modItem.testName = 'Lightening Impulse Voltage Withstand Test and Short Circuit Withstand (Thermal and Dynamic Ability) Test';
                    }
                    modItem.finalSample = 1;
                    // console.log(modItem);
                    checkedSamplesItemsAB.push(modItem);
                })
            });
           // console.log(checkedSamplesItemsA);
            var selectedItemsA = selectRandomItems(checkedSamplesItemsAB, seed, numOfSamples);

            for (const item of selectedItemsA) {
                await sampleModel.updateOne(
                  { di: di, 'items.itemID': item.itemID },
                  {
                    $set: {
                      'items.$.finalSample': item.finalSample,
                      'items.$.additionalTestRequired': item.additionalTestRequired,
                      'items.$.testName': item.testName
                    }
                  }
                );
              }


            }
        }
        

        // Generate notifications
        const groupedNotifications = Object.values(
            selectedItems.reduce((acc, item) => {
                const groupKey = `${item.uID}`;
                
                if (!acc[groupKey]) {
                    acc[groupKey] = {
                        title: `Samples selected at ${item.location} Sealing Time: ${sealingDate}`,
                        description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                        di,
                        materialName: item.materialName,
                        grnNo: item.grnNo,
                        location: item.location,
                        notificationFor: "AE",
                        discom: item.discom,
                        sapID,
                        officelocation: item.location,
                        uID,
                        loginPersonName,
                        items: [],
                    };
                }

                if (communicateStoreCenterSampleDetails == 1) {
                    acc[groupKey].description += `${item.itemID}, `;
                }
                acc[groupKey].items.push(item);
                if (/meter|transformer/i.test(matRes.materialTag)) {
                    const dqcKey = `${item.location}-DQC`;
                    if (!acc[dqcKey]) {
                        acc[dqcKey] = {
                            title: `DQC Notification for Samples at ${item.location} Sealing Time: ${sealingDate}`,
                            description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                            di,
                            materialName: item.materialName,
                            grnNo: item.grnNo,
                            location: item.location,
                            notificationFor: "DQC",
                            discom: item.discom,
                            sapID,
                            officelocation: item.location,
                            uID,
                            loginPersonName,
                            items: [],
                        };
                    }
                    if (communicateStoreCenterSampleDetails == 1) {
                        acc[dqcKey].description += `${item.itemID}, `;
                    }
                    acc[dqcKey].items.push(item);
                }

                const mmuKey = `${item.location}-MMU`;
                if (!acc[mmuKey]) {
                    acc[mmuKey] = {
                        title: `MMU Notification for Samples at ${item.location} Sealing Time: ${sealingDate}`,
                        description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                        di,
                        materialName: item.materialName,
                        grnNo: item.grnNo,
                        location: item.location,
                        notificationFor: "MMU",
                        discom: item.discom,
                        sapID,
                        officelocation: item.location,
                        uID,
                        loginPersonName,
                        items: [],
                    };
                }
                acc[mmuKey].description += `${item.itemID}, `;
                acc[mmuKey].items.push(item);

                return acc;
            }, {})
        );

        // Remove `items` property before inserting notifications
        const notifications = groupedNotifications.map(({ items, ...notification }) => notification);

        // Insert notifications
        for (const notification of notifications) {
            await notificationModel.create(notification);
        }

        return res.status(201).json({ status: 201, message: 'Samples created successfully'});
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error creating samples', error: error.message });
    }
};


export const additionalTestSamples = async (req, res) => {
    try {
        var { di, itemID } = req.body;
        const { selectedRole, sapID, location, uID, loginPersonName } = req.encodedUser;
        var frozenSample = 0;

       
            await sampleModel.updateOne(
                  { di: di, 'items.itemID': itemID },
                  {
                    $set: {
                      'items.$.additionalTestRequired': item.additionalTestRequired,
                      'items.$.testName': item.testName
                    }
                  }
                );


        if (req.body.frommultiplesample){
            // If manual selection is required, use the provided checkedItems instead of random selection
            var sampleres = await sampleModel.find({di:di});
            var checkedSamplesItemsA = [];
            sampleres.forEach((item) => {
                item.items.forEach((item1) => {
                    const modItem = JSON.parse(JSON.stringify(item1));
                    if(additionalTestRequired == 'yes'){
                        console.log('additionalTestRequired',additionalTestRequired);
                        modItem.additionalTestRequired = additionalTestRequired;
                        modItem.testName = 'Lightening Impulse Voltage Withstand Test and Short Circuit Withstand (Thermal and Dynamic Ability) Test';
                    }
                    modItem.finalSample = 1;
                    // console.log(modItem);
                    checkedSamplesItemsA.push(modItem);
                })
            });
           // console.log(checkedSamplesItemsA);
            selectedItems = selectRandomItems(checkedSamplesItemsA, seed, numOfSamples);

            for (const item of selectedItems) {
               
              }
        }
        else if (req.body.manual) {
            // If manual selection is required, use the provided checkedItems instead of random selection
            selectedItems = await Promise.all(checkedSamplesItems.map(async item => {
                const { grnNo, Serial_NO } = item;
                const grn = await grnModel.findById(grnNo);
        
                const sampleItem = {
                    itemID: Serial_NO,
                    materialName: grn.materialName,
                    grnNo: grn.grnNo,
                    location: grn.plantName,
                    uID: grn.uID,
                    discom: grn.discom,
                    testToPerform: grn.associatedTests,
                    inLabs: grn.associatedLabs,
                    Line_NO: grn.Line_NO
                };
        
                if (canDispatch == 1) {
                    sampleItem.finalSample = 1;
                }
        
                return sampleItem;
            }));
        } else {
            selectedItems = selectRandomItems(expandedItems, seed, numOfSamples);
        }
        


        const role = 'firm';
        var team = { memberName:matRes.Name_of_the_Firm, mobileNo:matRes.Supplier_Mobile_No, role, email:matRes.Supplier_email };


       // console.log(selectedItems);
        // Save new sample

        if (req.body.frommultiplesample == 1 ){

        }else{

        var newSample = new sampleModel({
            di,
            sealingDate,
            sealDetails,
            teamMembers: [team],
            items: selectedItems,
            additionalTestRequired,
            additionalTestName,
            uniqueSampleNo,
            communicateStoreCenterSampleDetails,
            sapID,
            location,
            uID,
            loginPersonName,
            associatedTags:associatedTags,
            canDispatch:canDispatch
        });

        await newSample.save();

        }

        await preSampleModel.findByIdAndUpdate(preSampleID, { sampleSelectionDone: 1 });


        if (diQuantity === totalQuantityRec) {
            const count = await sampleModel.countDocuments({ di });
        
            if (count === 1) {
                await sampleModel.findOneAndUpdate({ di }, { canDispatch: 1 });



            // If manual selection is required, use the provided checkedItems instead of random selection
            var sampleresA = await sampleModel.find({di:di});
            var checkedSamplesItemsAB = [];
            sampleresA.forEach((item) => {
                item.items.forEach((item1) => {
                    const modItem = JSON.parse(JSON.stringify(item1));
                    if(additionalTestRequired == 'yes'){
                        console.log('additionalTestRequired',additionalTestRequired);
                        modItem.additionalTestRequired = additionalTestRequired;
                        modItem.testName = 'Lightening Impulse Voltage Withstand Test and Short Circuit Withstand (Thermal and Dynamic Ability) Test';
                    }
                    modItem.finalSample = 1;
                    // console.log(modItem);
                    checkedSamplesItemsAB.push(modItem);
                })
            });
           // console.log(checkedSamplesItemsA);
            var selectedItemsA = selectRandomItems(checkedSamplesItemsAB, seed, numOfSamples);

            for (const item of selectedItemsA) {
                await sampleModel.updateOne(
                  { di: di, 'items.itemID': item.itemID },
                  {
                    $set: {
                      'items.$.finalSample': item.finalSample,
                      'items.$.additionalTestRequired': item.additionalTestRequired,
                      'items.$.testName': item.testName
                    }
                  }
                );
              }


            }
        }
        

        // Generate notifications
        const groupedNotifications = Object.values(
            selectedItems.reduce((acc, item) => {
                const groupKey = `${item.uID}`;
                
                if (!acc[groupKey]) {
                    acc[groupKey] = {
                        title: `Samples selected at ${item.location} Sealing Time: ${sealingDate}`,
                        description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                        di,
                        materialName: item.materialName,
                        grnNo: item.grnNo,
                        location: item.location,
                        notificationFor: "AE",
                        discom: item.discom,
                        sapID,
                        officelocation: item.location,
                        uID,
                        loginPersonName,
                        items: [],
                    };
                }

                if (communicateStoreCenterSampleDetails == 1) {
                    acc[groupKey].description += `${item.itemID}, `;
                }
                acc[groupKey].items.push(item);
                if (/meter|transformer/i.test(matRes.materialTag)) {
                    const dqcKey = `${item.location}-DQC`;
                    if (!acc[dqcKey]) {
                        acc[dqcKey] = {
                            title: `DQC Notification for Samples at ${item.location} Sealing Time: ${sealingDate}`,
                            description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                            di,
                            materialName: item.materialName,
                            grnNo: item.grnNo,
                            location: item.location,
                            notificationFor: "DQC",
                            discom: item.discom,
                            sapID,
                            officelocation: item.location,
                            uID,
                            loginPersonName,
                            items: [],
                        };
                    }
                    if (communicateStoreCenterSampleDetails == 1) {
                        acc[dqcKey].description += `${item.itemID}, `;
                    }
                    acc[dqcKey].items.push(item);
                }

                const mmuKey = `${item.location}-MMU`;
                if (!acc[mmuKey]) {
                    acc[mmuKey] = {
                        title: `MMU Notification for Samples at ${item.location} Sealing Time: ${sealingDate}`,
                        description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                        di,
                        materialName: item.materialName,
                        grnNo: item.grnNo,
                        location: item.location,
                        notificationFor: "MMU",
                        discom: item.discom,
                        sapID,
                        officelocation: item.location,
                        uID,
                        loginPersonName,
                        items: [],
                    };
                }
                acc[mmuKey].description += `${item.itemID}, `;
                acc[mmuKey].items.push(item);

                return acc;
            }, {})
        );

        // Remove `items` property before inserting notifications
        const notifications = groupedNotifications.map(({ items, ...notification }) => notification);

        // Insert notifications
        for (const notification of notifications) {
            await notificationModel.create(notification);
        }

        return res.status(201).json({ status: 201, message: 'Samples created successfully', data: newSample });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error creating samples', error: error.message });
    }
};




export const addExtraTestToSamples = async (req, res) => {
    try {
        const { di,  additionalTestRequired,  sampleID, itemID } = req.body;

        if (!sampleID || !itemID) {
            return res.status(400).json({ message: 'sampleID and itemID are required' });
        }
        if (!di) {
            return res.status(400).json({ status: 400, message: 'Missing required fields' });
        }

        const sampleObjectId = new mongoose.Types.ObjectId(sampleID);
        const itemObjectId = new mongoose.Types.ObjectId(itemID);

        if (additionalTestRequired == 'yes' ) {

                // Step 1: First, unset (clear) 'additionalTestRequired' and 'testName' from all items
                await sampleModel.updateOne(
                    { _id: sampleObjectId },
                    {
                        $unset: {
                            'items.$[].additionalTestRequired': '',
                            'items.$[].testName': ''
                        }
                    }
                );


        const updatedSample = await sampleModel.findOneAndUpdate(
            { _id: sampleObjectId, 'items._id': itemObjectId }, // match document and specific item
            {
                $set: {
                    'items.$.additionalTestRequired': 'yes',
                    'items.$.testName': 'Lightening Impulse Voltage Withstand Test and Short Circuit Withstand (Thermal and Dynamic Ability) Test'
                }
            },
            { new: true } // return the updated document
        );

        if (!updatedSample) {
            return res.status(404).json({ message: 'Sample or item not found' });
        }

        return res.status(200).json({
            message: 'Item updated successfully',
            data: updatedSample
        });    
       
     }else{

        await sampleModel.updateOne(
            { _id: sampleObjectId },
            {
                $unset: {
                    'items.$[].additionalTestRequired': '',
                    'items.$[].testName': ''
                }
            }
        );

        return res.status(200).json({
            message: 'Item updated successfully'
        });    
     }

       //  return res.status(201).json({ status: 201, message: 'Samples created successfully', data: newSample });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error creating samples', error: error.message });
    }
};




export const createSamplesOld = async (req, res) => {
    try {
        const { di, checkedItems ,numOfSamples, sealingDate, sealDetails, teamMembers } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;

        if (!di || !numOfSamples || !sealingDate) {
            return res.status(400).json({ status: 400, message: 'Missing required fields' });
        }

        if (!checkedItems || checkedItems.length === 0) {
            return res.status(400).json({ status: 400, error: "No items selected" });
        }


       
        // Create a filter to match the selected items by their IDs
        const idFilter = checkedItems.map(item => item.id);

        // Fetch GRNs associated with the selected DI and matching IDs
        
        const grns = await grnModel.find({
        di, // Ensure the DI matches
        _id: { $in: idFilter }, // Match any of the selected IDs
        });

        // console.log(grns);
        if (!grns.length) {
            return res.status(404).json({ status: 404, message: 'No GRNs found for the selected DI' });
        }

       

    const expandedItems = grns.flatMap(grn => {
    let tempItems = [];
    
    // console.log(grn.receiveMaterailList.length,grn.customReceivedMaterial.length,grn.quantity);    

    
    if (
        grn.quantity !== 
        (Array.isArray(grn.receiveMaterailList) ? grn.receiveMaterailList.length : 0) + 
        (Array.isArray(grn.customReceivedMaterial) ? grn.customReceivedMaterial.length : 0)
    ) {
        return res.status(400).json({ 
            status: 400, 
            message: `Received Quantity and received items do not match for GRN ${grn.grnNo}`
        });
    }

    grn.receiveMaterailList.forEach(material => {
        for (let i = 0; i < 1; i++) {
            tempItems.push({ 
                itemID: material.Serial_NO, 
                materialName: grn.materialName, 
                grnNo: grn.grnNo, 
                location: grn.storeLocation, 
                uID: grn.uID, 
                discom: grn.discom, 
                testToPerform: grn.associatedTests, 
                inLabs: grn.associatedLabs, 
                Line_NO: grn.Line_NO 
            });
        }
    });

    grn.customReceivedMaterial.forEach(material => {
        for (let i = 0; i < 1; i++) {
            tempItems.push({ 
                itemID: material.name, 
                materialName: grn.materialName, 
                grnNo: grn.grnNo, 
                location: grn.storeLocation, 
                uID: grn.uID, 
                discom: grn.discom, 
                testToPerform: grn.associatedTests, 
                inLabs: grn.associatedLabs, 
                Line_NO: grn.Line_NO 
            });
        }
    });

    return tempItems;
});

if (expandedItems.length < numOfSamples) {
    return res.status(400).json({ status: 400, message: 'Insufficient items for the requested sample size' });
}

await grnModel.updateMany({
    di, // Ensure the DI matches
    _id: { $in: idFilter }, // Match any of the selected IDs
    },{$set: {
        sampleSelectedFromIt: 1
    }});


    const seed = 1234; // Change this for different results
    const selectedItems = selectRandomItems(expandedItems, seed, numOfSamples);

    // console.log(selectedItems);


    // return res.status(200).json({ status: 400, selectedItems: selectedItems });



        // Create a new sample entry
        const newSample = new sampleModel({
            di,
            sealingDate,
            sealDetails,
            teamMembers,
            items: selectedItems,
            sapID,
            location,
            uID,
            loginPersonName
        });

        await newSample.save();

        var matRes = await materialModel.findOne({di:di});
        var recipient = matRes.Supplier_email;
        if (1==2) {
            const selectedItemsTable = `
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th>Item ID</th>
                            <th>Material Name</th>
                            <th>GRN No</th>
                            <th>Line No</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${selectedItems.map(item => `
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
        
            sendEmail(
                recipient,
                `Your DI ${di} has been selected`,
                `<br><br>${selectedItemsTable}`,
                "" // Replace with actual image path if needed
            );
        }
        
        
        


        /* const notifications = selectedItems.map((item) => ({
            title: `Sample selected ${item.itemID}`,
            description: `Sample selected DI ${di}, Material: ${item.materialName}, Line_NO: ${item.Line_NO}, grnNo:${item.grnNo} itemID:${item.itemID}`,
            di: di,
            materialName: item.materialName,
            grnNo: item.grnNo,
            location: item.location,
            notificationFor: "AE",
            sapID: sapID,
            name: name,
            uID: uID,
        }));

        await notificationModel.insertMany(notifications); */


        /* const groupedNotifications = Object.values(
            selectedItems.reduce((acc, item) => {
                // Group by location and sealingDate
                const groupKey = `${item.location}`;
                if (!acc[groupKey]) {
                    acc[groupKey] = {
                        title: `Samples selected at ${item.location} Sealing Time: ${sealingDate}`,
                        description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                        di: di,
                        materialName: item.materialName,
                        grnNo: item.grnNo,
                        location: item.location,
                        notificationFor: "AE",
                        discom:item.discom,
                        sapID: sapID,
                        name: name,
                        uID: uID,
                        items: [], // To store grouped item details for extended use
                    };
                }
        

                

                // Append item details to the description and items array
                acc[groupKey].description += `${item.itemID}, `;
                acc[groupKey].items.push(item);
                return acc;
            }, {})
        ); */
        
        const groupedNotifications = Object.values(
            selectedItems.reduce((acc, item) => {
                // Group by location
                const groupKey = `${item.uID}`;
                
                // Initialize notification for AE
                if (!acc[groupKey]) {
                    acc[groupKey] = {
                        title: `Samples selected at ${item.location} Sealing Time: ${sealingDate}`,
                        description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                        di: di,
                        materialName: item.materialName,
                        grnNo: item.grnNo,
                        location: item.location,
                        notificationFor: "AE",
                        discom: item.discom,
                        sapID: item.sapID,
                        officelocation: item.location,
                        uID: item.uID,
                        loginPersonName: item.loginPersonName,
                        items: [], // To store grouped item details for extended use
                    };
                }
        
                // Append item details to the description and items array
                acc[groupKey].description += `${item.itemID}, `;
                acc[groupKey].items.push(item);
        
                // Push an additional notification for DQC if materialName contains "meter" or "transformer"
                if (/meter|transformer/i.test(item.materialName)) {
                    const dqcKey = `${item.location}-DQC`; // Separate groupKey for DQC notifications
                    if (!acc[dqcKey]) {
                        acc[dqcKey] = {
                            title: `DQC Notification for Samples at ${item.location} Sealing Time: ${sealingDate}`,
                            description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                            di: di,
                            materialName: item.materialName,
                            grnNo: item.grnNo,
                            location: item.location,
                            notificationFor: "DQC",
                            discom: item.discom,
                            sapID: item.sapID,
                            officelocation: item.location,
                            uID: item.uID,
                            loginPersonName: item.loginPersonName,
                            items: [], // To store grouped item details for extended use
                        };
                    }
                    acc[dqcKey].description += `${item.itemID}, `;
                    acc[dqcKey].items.push(item);
                }
        
                if (1==1) {
                    const dqcKey = `${item.location}-MMU`; // Separate groupKey for DQC notifications
                    if (!acc[dqcKey]) {
                        acc[dqcKey] = {
                            title: `MMU Notification for Samples at ${item.location} Sealing Time: ${sealingDate}`,
                            description: `Samples selected at ${item.location}. DI: ${di}, Material: ${item.materialName}, itemID are: `,
                            di: di,
                            materialName: item.materialName,
                            grnNo: item.grnNo,
                            location: item.location,
                            notificationFor: "MMU",
                            discom: item.discom,
                            sapID: item.sapID,
                            officelocation: item.location,
                            uID: item.uID,
                            loginPersonName: item.loginPersonName,
                            items: [], // To store grouped item details for extended use
                        };
                    }
                    acc[dqcKey].description += `${item.itemID}, `;
                    acc[dqcKey].items.push(item);
                }

                return acc;
            }, {})
        );



        // Remove the `items` property before inserting notifications
        const notifications = groupedNotifications.map(({ items, ...notification }) => notification);

        // Insert notifications after checking for duplicates
        for (const notification of notifications) {
            await notificationModel.create(notification);
            /* const exists = await notificationModel.findOne({ title: notification.title });
            if (!exists) {
                await notificationModel.create(notification);
            } else {
               // console.log(`Notification with title "${notification.title}" already exists. Skipping.`);

                await notificationModel.create(notification);
            } */
        }
        


        // console.log('selectedItems',selectedItems);

        return res.status(201).json({ status: 201, message: 'Samples created successfully', data: newSample });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error creating samples', error: error.message });
    }
};

// List Samples
export const listSamples = async (req, res) => {
    try {
        const { page = 1, limit = 10,di,id } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        const filter = {};
        if (di) filter.di = di;
        if (id) filter._id = new mongoose.Types.ObjectId(id);

        if (selectedRole == 'EE (STORE)' || selectedRole == 'AE (STORE)' || selectedRole == 'SE (STORE)' ) {
            filter['items'] = { $elemMatch: { uID: uID } };
            // const filteredItems = doc.items.filter((item) => item.uID === uID);
        }
        // console.log(filter);
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
        }; 

        const result = await sampleModel.paginate(filter, options);

        // Filter items by location if provided


        if (selectedRole == 'EE (STORE)' || selectedRole == 'AE (STORE)' || selectedRole == 'SE (STORE)' ) {
        if (uID) {
            // const locationRegex = new RegExp(location, 'i'); // Create regex for case-insensitive match
            result.docs = result.docs.map((doc) => {
                // const filteredItems = doc.items.filter((item) => locationRegex.test(item.location));
                const filteredItems = doc.items.filter((item) => item.uID === uID);
                return {
                    ...doc._doc, // Spread to copy the document
                    items: filteredItems, // Replace items with filtered ones
                };
            });
        }
        }


        return res.status(200).json({
            status: 200,
            message: 'List of samples',
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
        return res.status(500).json({ status: 500, message: 'Error fetching samples', error: error.message });
    }
};


export const groupSamples = async (req, res) => {

try {
        const { page = 1, limit = 10, di, id } = req.body;

        const filter = {};
        if (di) filter.di = di;
        if (id) filter._id = new mongoose.Types.ObjectId(id);

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
        };

        const result = await sampleModel.paginate(filter, options);

        // Group `items` by uID inside each document
        result.docs = result.docs.map((doc) => {
    return doc.items.reduce((acc, item) => {
        const itemObj = item.toObject(); // Convert Mongoose subdocument to plain object
        itemObj.sampleId = doc._id;      // Now safe to add custom fields

        if (!acc[itemObj.location]) acc[itemObj.location] = [];
        acc[itemObj.location].push(itemObj);

        return acc;
    }, {});
});



        return res.status(200).json({
            status: 200,
            message: 'List of samples (items grouped by uID)',
            data: result.docs,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            nextPage: result.nextPage,
            prevPage: result.prevPage,
            limit: result.limit,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Error fetching samples',
            error: error.message,
        });
    }


};




// Delete Sample
// Delete Sample by itemID
export const deleteSampleByItemID = async (req, res) => {
    try {
        const { itemID, di, id } = req.body;
        if(itemID){
        // Find the sample containing the specified itemID
            const sample = await sampleModel.findOne({ 'items.itemID': itemID });

            if (!sample) {
                return res.status(404).json({ status: 404, message: 'Sample with the given itemID not found' });
            }

        // Filter out the item with the specified itemID from the sample
            sample.items = sample.items.filter(item => item.itemID !== itemID);

            // If no items remain in the sample, delete the entire sample
            if (sample.items.length === 0) {
                await sampleModel.findByIdAndDelete(sample._id);
                return res.status(200).json({ status: 200, message: 'Sample deleted as no items remain' });
            }

        // Save the updated sample
            await sample.save();
        
            return res.status(200).json({ status: 200, message: 'Item deleted successfully from sample', data: sample });

    
        }

        if (di){
            const sample = await sampleModel.findOneAndDelete({ di: di });
            return res.status(200).json({ status: 200, message: 'Item deleted successfully from sample', data: sample });
        }
        if (id){

            await grnModel.updateMany({ di: di }, { $set: { sampleSelectedFromIt: 0 } });
            const sample = await sampleModel.findByIdAndDelete(id);
            return res.status(200).json({ status: 200, message: 'Item deleted successfully from sample', data: sample });
        }

    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Error deleting sample', error: error.message });
    }
};
