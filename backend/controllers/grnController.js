import materialModel from "../models/materialModel.js";
import grnModel from "../models/grnModel.js";
import { createObjectCsvWriter } from 'csv-writer';
import axios from "axios";
import https from "https";
import { constants } from "crypto";
import path from "path";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationModel from "../models/notificationModel.js";
import receiveMaterialModel from "../models/receiveMaterialModel.js";
dotenv.config();
const UPLOAD_PATH =  'https://devops1.uppcl.org/qualitycell/uploads/';

const agent = new https.Agent({
    secureOptions: constants.SSL_OP_LEGACY_SERVER_CONNECT, // Enable legacy SSL options
  });

const fetchTestsAndLabs = async (di, Material_Name, Line_NO) => {
  try {
    const material = await materialModel.findOne({ di });
    if (!material) {
      throw new Error(`No material found for the provided di: ${di}`);
    }
    const tags = material.materialTag;

    let matchedData = null;

    material.Data.forEach((item) => {
      // Log the item to verify it's a Map
      // console.log(item);

  // Use `.get()` to access properties


  if (item.get('Material_Name') === Material_Name && item.get('Line_NO') === Line_NO) {
    
    matchedData = item;
    // console.log('matchedData',matchedData.get('tests'))
  }
});
    
    if (!matchedData) {
      // console.log(`No matching data found for Material_Name: ${Material_Name} and Line_NO: ${Line_NO}.`);
    }
    

    if (!matchedData) {
      return { tests: [], labs: [], tags };
      /* throw new Error(
        `No matching data found for Material_Name: ${Material_Name} and Line_NO: ${Line_NO}.`
      );*/
    }

   //  console.log(matchedData);
    const tests = matchedData.get('tests') || [];
    const labs = matchedData.get('labs') || [];
    return { tests, labs, tags };
  } catch (error) {
    throw new Error(`Error fetching tests and labs: ${error.message}`);
  }
};


export const getGRN = async (req,res) => {

  // const API_URL = "https://po-dev.erp.uppclonline.com/RESTAdapter/QC/GRN_NO";
  const API_URL = "https://po.erp.uppclonline.com/RESTAdapter/QC/GRN_NO";

  // Basic Auth Credentials
  const username = "UPPCL_QUALITY_CELL";
  const password = "Uppcl@123";
  
  // Encode credentials to Base64
  const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
  
  const requestBody = {
    GRN_NO: req.body.GRN_NO,
    SAP_ID: req.body.SAP_ID,
    Year: req.body.Year
  };
  
  /* const requestBody = {
    GRN_NO: "5000004795",
    SAP_ID: "AFAISAL",
    Year: "2025"
  }; */

  try {
    const response = await axios.post(API_URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      httpsAgent: agent
    });
    return res.json({
      Status: "Success",
      Status_Code: 200,
      data: response.data
    });
    // console.log("Response:", response.data);
  } catch (error) {
    return res.json({
      Status: "Failure",
      Status_Code: error.response? error.response.status : 500,
      error: error.response? error.response.data : error.message
    });
  }
}



export const addGRN_New = async (req, res) => {
  try {
    const { grnData, suppliedQtyAgainstPOTillDate, remainingQtyToBeDelivered, additionalTestRequired, uniqueSampleNo } = req.body;
    const { selectedRole, sapID, location, uID, loginPersonName } = req.encodedUser;

    if (!Array.isArray(grnData) || grnData.length === 0) {
      return res.status(400).json({
        Status: "Failure",
        "Status Code": 400,
        error: "grnData must be a non-empty array"
      });
    }

    const processedData = [];
    const skippedRecords = [];

    for (const item of grnData) {

     // console.log(JSON.stringify(item.receiveMaterailList.slice(0, 5), null, 2)); 
     // return;

      const { materialName, Line_NO, di, grnNo, storeLocation, year, customReceivedMaterial, receiveMaterailList } = item;

      const existingGrn = await grnModel.findOne({ di, grnNo, year, storeLocation });
      if (existingGrn) {
        skippedRecords.push({ grnNo, year, storeLocation, status: "Skipped (Already Exists)" });
        continue;
      }

      const discom = (await materialModel.findOne({ di }))?.location || "";

      await notificationModel.create({
        title: "New GRN Added",
        description: `A new GRN No. ${grnNo} has been added for Di ${di} Line_NO ${Line_NO} material ${materialName} location ${storeLocation}`,
        di,
        materialName,
        grnNo,
        location: storeLocation,
        notificationFor: "DQC",
        sapID,
        officelocation: location,
        uID,
        loginPersonName,
        discom
      });

      const { tests, labs, tags } = await fetchTestsAndLabs(di, materialName, Line_NO);

      processedData.push({
        ...item,
        discom,
        associatedTests: tests,
        associatedLabs: labs,
        associatedTags: tags,
        sapID,
        location,
        uID,
        loginPersonName,
        status: "Inserted",
        suppliedQtyAgainstPOTillDate,
        remainingQtyToBeDelivered,
        additionalTestRequired,
        uniqueSampleNo,
        customReceivedMaterial: Array.isArray(customReceivedMaterial)
          ? customReceivedMaterial.map(({ name, quantity }) => ({ name, quantity }))
          : [],
        receiveMaterailList: Array.isArray(receiveMaterailList)
          ? receiveMaterailList.map(({ Serial_NO }) => ({ Serial_NO }))
          : []
      });
    }

    // Insert GRNs
    const newGrnsData = processedData.filter(item => item.status === "Inserted");
    const insertedGrns = await grnModel.insertMany(newGrnsData);

    // Create linked ReceiveMaterial records
    await Promise.all(
      insertedGrns.map(grn => {
        const grnInput = newGrnsData.find(d => d.di === grn.di && d.grnNo === grn.grnNo && d.storeLocation === grn.storeLocation && d.year === grn.year);
        if (!grnInput?.receiveMaterailList?.length) return null;
        return receiveMaterialModel.create({
          grnId: grn._id,
          serials: grnInput.receiveMaterailList
        });
      })
    );

    // Prepare response
    const responseData = insertedGrns.map(grn => ({
      DINo: grn.di || "",
      "Line No": grn.Line_NO,
      "Contract No": grn.Contract_No || "",
      "Total Quantity of the Line No": grn.totalQuantityLineNo || "",
      "Material Code": grn.materialCode || "",
      "Material Name": grn.materialName,
      "Quantity Received": grn.quantity,
      "Received Date": grn.receiveDate?.toISOString() || "",
      "Received Material List": [], // now stored in ReceiveMaterial collection
      "Custom Material List": grn.customReceivedMaterial || [],
      "Mat Group": grn.Mat_Group || "",
      Plant: grn.plant || "",
      "Plant Name": grn.plantName || "",
      "Store Location": grn.storeLocation || "",
      "Associated Tests": grn.associatedTests || [],
      "Associated Labs": grn.associatedLabs || [],
      "Supplied Qty Against PO Till Date": grn.suppliedQtyAgainstPOTillDate || "",
      "Remaining Qty To Be Delivered": grn.remainingQtyToBeDelivered || "",
      "Additional Test Required": grn.additionalTestRequired || "",
      "Unique Sample No": grn.uniqueSampleNo || "",
      "Associated Tags": grn.associatedTags || ""
    }));

    return res.status(201).json({
      Status: "Success",
      "Status Code": 201,
      Data: responseData,
      Skipped: skippedRecords
    });

  } catch (error) {
    return res.status(500).json({
      Status: "Failure",
      "Status Code": 500,
      error: "Error adding GRNs",
      details: error.message
    });
  }
};



export const addGRN = async (req, res) => {
  try {
    const { grnData, suppliedQtyAgainstPOTillDate,remainingQtyToBeDelivered,additionalTestRequired,uniqueSampleNo } = req.body;
    const { selectedRole,sapID,location,uID,loginPersonName } = req.encodedUser;
    
   
    

    if (!Array.isArray(grnData) || grnData.length === 0) {
      return res
        .status(400)
        .json({ Status: "Failure", "Status Code": 400, error: "grnData must be a non-empty array" });
    }
    var globalDi = '';
    const processedData = await Promise.all(
      grnData.map(async (item) => {
        const {  materialName, Line_NO, di,grnNo,storeLocation,year, customReceivedMaterial,  quantity } = item;
        globalDi = di;
        var discom = "";
        const existingDi = await materialModel.findOne({ di });
        if (existingDi) {
          discom = existingDi.location;
        }
        // Check if GRN already exists
      const existingGrn = await grnModel.findOne({ di, grnNo, year, storeLocation });

      if (existingGrn) {
        // Skip if already exists
        return { ...item, status: "Skipped (Already Exists)" };
      }

        await notificationModel.create({
          title: "New GRN Added",
          description: `A new GRN No. ${grnNo} has been added for Di ${di} Line_NO ${Line_NO} material ${materialName} location ${storeLocation} `,
          di: di,
          materialName: materialName,
          grnNo: grnNo,
          location:storeLocation,
          notificationFor: "DQC",
          // notificationFor: /meter|transformer/i.test(materialName) ? "UQC" : "DQC",
          sapID: sapID,
          officelocation: location,
          uID: uID,
          loginPersonName: loginPersonName,
          discom:discom
        });


        const { tests, labs, tags } = await fetchTestsAndLabs(di, materialName, Line_NO);

       // console.log('tests22222', tests);
        return {
          ...item,
          discom:discom,
          associatedTests: tests,
          associatedLabs: labs,
          associatedTags: tags,
          sapID,
          location,
          uID,
          loginPersonName,
          status: "Inserted",
          suppliedQtyAgainstPOTillDate,
          remainingQtyToBeDelivered,
          additionalTestRequired,
          uniqueSampleNo,
          customReceivedMaterial: Array.isArray(customReceivedMaterial)
          ? customReceivedMaterial.map(({ name, quantity }) => ({ name, quantity })) // Ensure correct format
          : [] // Default to empty array if invalid
        };
      })
    );
    const newGrnsData = processedData.filter((item) => item.status === "Inserted");
    // Save all GRN records in bulk
    const newGrns = await grnModel.insertMany(newGrnsData);

 // Append skipped records to the response
  const skippedRecords = processedData.filter((item) => item.status === "Skipped (Already Exists)");


    // Map the saved records to response format
    const responseData = newGrns.map((grn) => ({
      DINo: grn.di || "",
      "Line No": grn.Line_NO,
      "Contract No": grn.Contract_No || "",
      "Total Quantity of the Line No": grn.totalQuantityLineNo || "",
      "Material Code": grn.materialCode || "",
      "Material Name": grn.materialName,
      "Quantity Received": grn.quantity,
      "Received Date": grn.receiveDate ? grn.receiveDate.toISOString() : "",
      "Received Material List": grn.receiveMaterailList || [],
      "Custom Material List": grn.customReceivedMaterial || [],
      "Mat Group": grn.Mat_Group || "",
      Plant: grn.plant || "",
      "Plant Name": grn.plantName || "",
      "Store Location": grn.storeLocation || "",
      "Associated Tests": grn.associatedTests || [],
      "Associated Labs": grn.associatedLabs || [],
      "Supplied Qty Against PO Till Date": grn.suppliedQtyAgainstPOTillDate || "",
      "Remaining Qty To Be Delivered": grn.remainingQtyToBeDelivered || "",
      "Additional Test Required": grn.additionalTestRequired || "",
      "Unique Sample No": grn.uniqueSampleNo || "",
      "Associated Tags": grn.associatedTags || "",
    }));


    /* 
    var diQuantity = 0;
    var totalQuantityRec = 0;
    var matResponse = await materialModel.findOne({di:globalDi});
    // console.log('matResponse', matResponse.Data[0].get('Quantity'));
     matResponse.Data.forEach((item) => {
      diQuantity += item.get('Quantity');
    });    
    
    var matResponse = await grnModel.find({di:globalDi});
    matResponse.forEach((item) => {
      totalQuantityRec += item.quantity;
    })




    if (diQuantity ==  totalQuantityRec) {
      await materialModel.findOneAndUpdate({ di:globalDi }, { totalQuantityReceived: 1 , receivedQuantity: totalQuantityRec });
    }else{
      await materialModel.findOneAndUpdate({ di:globalDi }, { totalQuantityReceived: 0, receivedQuantity: totalQuantityRec });
    } */
 
    return res.status(201).json({
      Status: "Success",
      "Status Code": 201,
      Data: responseData,
      Skipped: skippedRecords.map((item) => ({
        grnNo: item.grnNo,
        year: item.year,
        storeLocation: item.storeLocation,
        status: item.status,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      Status: "Failure",
      "Status Code": 500,
      error: "Error adding GRNs",
      details: error.message,
    });
  }
};



export const addGRNOld1 = async (req, res) => {
    try {
      const { grnData } = req.body; // Extract grnData array from the request body
      const { selectedRole,sapID,location,uID,loginPersonName } = req.encodedUser;
  
      if (!Array.isArray(grnData) || grnData.length === 0) {
        return res.status(400).json({ Status: "Failure", "Status Code": 400, error: "grnData must be a non-empty array" });
      }
  
      const processedData = grnData.map(async (item) => {
        const { grnNo, quantity, materialName, Line_NO, di } = item;
        
     //    console.log(materialName,Line_NO,di);
        // Validate required fields
        /* if (!grnNo || !quantity || !materialName || !Line_NO || !di) {
         //  throw new Error("Missing required fields: grnNo, quantity, materialName, Line_NO");
          return res.status(400).json({ Status: "Failure", "Status Code": 400, error: "Missing required fields: grnNo, quantity, materialName, Line_NO" });
        } */
  

        const { tests, labs } = await fetchTestsAndLabs(di, materialName, Line_NO);
        return tests;
        return {
          ...item,
          associatedTests: tests,
          associatedLabs: labs,
          sapID,
          name,
          uID,
        };
      });
  
      // Save all GRN records in bulk
      const newGrns = await grnModel.insertMany(processedData);
  
      // Map the saved records to response format
      const responseData = newGrns.map((grn) => ({
        DINo: grn.di || "",
        "Line No": grn.Line_NO,
        "Contract No": grn.Contract_No || "",
        "Total Quantity of the Line No": grn.totalQuantityLineNo || "",
        "Material Code": grn.materialCode || "",
        "Material Name": grn.materialName,
        "Quantity Received": grn.quantity,
        "Received Date": grn.receiveDate ? grn.receiveDate.toISOString() : "",
        "Received Material List": grn.receiveMaterailList || [],
        "Mat Group": grn.Mat_Group || "",
        Plant: grn.plant || "",
        "Plant Name": grn.plantName || "",
        "Store Location": grn.storeLocation || "",
      }));
  
      return res.status(201).json({
        Status: "Success",
        "Status Code": 201,
        Data: responseData,
      });
    } catch (error) {
      return res.status(500).json({
        Status: "Failure",
        "Status Code": 500,
        error: "Error adding GRNs",
        details: error.message,
      });
    }
  };
  


export const addGRNOld = async (req,res) => {
    try {
        const {materialID} = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        const sample = await materialModel.findById(materialID);
        if (!sample) {
            return res.status(404).json({ status:404, error: "materail not found" });
        }
        req.body.sapID = sapID;
        req.body.name = name;
        req.body.uID = uID;
        req.body.di = sample.di;
        const grnData = req.body;
        const newGrn = new grnModel(grnData);
        await newGrn.save();
        return res.status(201).json({ status:201, message: "GRN added successfully", newGrn });
    } catch (error) {
        return res.status(500).json({ status:500,error: "Error adding GRN", details: error.message });
    }
}


export const updateGRN = async (req,res) => {
    try {
        const {grnId,grnNo,fromSerial,toSerial, identifyingParticulars,quantity, materialName, Line_NO} = req.body;


        const grn = await grnModel.findById(grnId);
        if (!grn) return res.status(404).json({ status:404, error: "GRN not found" });

        if (grnNo) grn.grnNo = grnNo;
        if (fromSerial) grn.fromSerial = fromSerial;
        if(toSerial) grn.toSerial = toSerial;
        if(identifyingParticulars) grn.identifyingParticulars = identifyingParticulars;
        if(quantity) grn.quantity = quantity;
        if (materialName) grn.materialName = materialName;
        if (Line_NO) grn.Line_NO = Line_NO;
        // console.log(grn);
        await grn.save();


        res.status(200).json({ status:200,  message: "GRN updated successfully", grn });

    } catch (error) {
        return res.status(500).json({ status:500,error: "Error adding GRN", details: error.message });
    }
}

export const deleteGRN = async (req,res) => {
    try {
        const {grnId} = req.body;

        const sample = await grnModel.findById(grnId);
        if (!sample) return res.status(404).json({ status:404, error: "Grn not found" });

        const grnData = await grnModel.findByIdAndDelete(grnId);

        return res.status(200).json({ status:200,message: "GRN deleted successfully", grnData });
    } catch (error) {
        return res.status(500).json({ status:500,error: "Error deletin GRN", details: error.message });
    }
}


export const listGRN = async (req, res) => {
    try {
        const { page = 1, limit = 10, materialID, id, excel } = req.body;
        const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
        const filter = {};

        if (selectedRole == 'admin') {
        }else if (selectedRole == 'EE (STORE)' || selectedRole == 'AE (STORE)' || selectedRole == 'SE (STORE)' ) {
            filter.uID = uID;
        }else if (selectedRole === "DQC") {
            filter.discom = location;
            // filter.materialName = { $nin: [/Transformer/i, /Meter/i] }; // Exclude Transformer and Meter
        } else if (selectedRole === "UQC") {
            filter.associatedTags = { $in: [/Meter/i, /Transformer/i] }; // Include Meter or Transformer
            filter.showToUQC = 1; 
        }
        if (materialID) filter.di = materialID;
        if (id) filter._id = new mongoose.Types.ObjectId(id);
       
        
        if (excel == 1){

          const paginatedRecords = await grnModel.find(filter);
          const transformedData = paginatedRecords.map(record => {
            return {
                di: record.di,
                Line_NO: record.Line_NO,
                Contract_No: record.Contract_No,
                materialName: record.materialName,
                materialCode: record.materialCode,
                Mat_Group: record.Mat_Group,
                totalQuantityLineNo: record.totalQuantityLineNo,
                receiveMaterailList: record.receiveMaterailList,
                receiveDate: record.receiveDate,
                quantity: record.quantity,
            };
        });
    
        const headers = [
            { id: 'di', title: 'di' },
            { id: 'Line_NO', title: 'Line_NO' },
            { id: 'Contract_No', title: 'Contract_No' },
            { id: 'materialName', title: 'materialName' },
            { id: 'materialCode', title: 'materialCode' },
            { id: 'Mat_Group', title: 'Mat_Group' },
            { id: 'totalQuantityLineNo', title: 'Quantity' },
            { id: 'receiveDate', title: 'receiveDate' },
            { id: 'quantity', title: 'Quantity receive' },
            { id: 'receiveMaterailList', title: 'receiveMaterailList' },
        ];
    
        const csvWriter = createObjectCsvWriter({
            path: 'output.csv', // This should be dynamically generated or managed
            header: headers
        });
    
        csvWriter
            .writeRecords(transformedData)
            .then(() => {
                res.download('output.csv', 'output.csv', (err) => {
                    if (err) {
                        console.error('Error downloading the file:', err);
                        res.sendStatus(500);
                    } else {
                        console.log('File downloaded successfully');
                    }
                });
            })
            .catch((err) => {
                console.error('Error writing CSV file:', err);
                res.sendStatus(500);
            });


        }else{
        
        // Options for pagination
        const options = {
            page: parseInt(page, 10),   // Convert page to integer
            limit: parseInt(limit, 10), // Convert limit to integer
            sort: { createdAt: -1 },     // Sort by most recent users
            /* populate: {
                path: 'materialID',          // Populate the 'tests' field
            }*/
        };


        // Paginate GRNs array
        const result = await grnModel.paginate(filter, options);

        return res.status(200).json({
            status: 200,
            message: 'List of grns ',
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
      }
    } catch (error) {
        return res.status(500).json({ status:500, error: error.message });
    }
};

export const listGRNSampleNotSelected = async (req, res) => {
  try {
      const { page = 1, limit = 10, materialID, id, excel } = req.body;
      const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
      const filter = {};

      if (selectedRole == 'admin') {
      }else if (selectedRole == 'EE (STORE)' || selectedRole == 'AE (STORE)' || selectedRole == 'SE (STORE)' ) {
          filter.uID = uID;
      }else if (selectedRole === "DQC") {
          filter.discom = location;
          // filter.materialName = { $nin: [/Transformer/i, /Meter/i] }; // Exclude Transformer and Meter
      } else if (selectedRole === "UQC") {
          //filter.materialName = { $in: [/Meter/i, /Transformer/i] }; // Include Meter or Transformer
         // filter.showToUQC = 1; 
      
          filter.associatedTags = { $in: [/Meter/i, /Transformer/i] }; // Include Meter or Transformer
          filter.showToUQC = 1; 
 
        }
      filter.sampleSelectedFromIt = { $ne: 1 };
      if (materialID) filter.di = materialID;
      if (id) filter._id = new mongoose.Types.ObjectId(id);
     
      
      if (excel == 1){

        const paginatedRecords = await grnModel.find(filter);
        const transformedData = paginatedRecords.map(record => {
          return {
              di: record.di,
              Line_NO: record.Line_NO,
              Contract_No: record.Contract_No,
              materialName: record.materialName,
              materialCode: record.materialCode,
              Mat_Group: record.Mat_Group,
              totalQuantityLineNo: record.totalQuantityLineNo,
              receiveMaterailList: record.receiveMaterailList,
              receiveDate: record.receiveDate,
              quantity: record.quantity,
          };
      });
  
      const headers = [
          { id: 'di', title: 'di' },
          { id: 'Line_NO', title: 'Line_NO' },
          { id: 'Contract_No', title: 'Contract_No' },
          { id: 'materialName', title: 'materialName' },
          { id: 'materialCode', title: 'materialCode' },
          { id: 'Mat_Group', title: 'Mat_Group' },
          { id: 'totalQuantityLineNo', title: 'Quantity' },
          { id: 'receiveDate', title: 'receiveDate' },
          { id: 'quantity', title: 'Quantity receive' },
          { id: 'receiveMaterailList', title: 'receiveMaterailList' },
      ];
  
      const csvWriter = createObjectCsvWriter({
          path: 'output.csv', // This should be dynamically generated or managed
          header: headers
      });
  
      csvWriter
          .writeRecords(transformedData)
          .then(() => {
              res.download('output.csv', 'output.csv', (err) => {
                  if (err) {
                      console.error('Error downloading the file:', err);
                      res.sendStatus(500);
                  } else {
                      console.log('File downloaded successfully');
                  }
              });
          })
          .catch((err) => {
              console.error('Error writing CSV file:', err);
              res.sendStatus(500);
          });


      }else{
      
      // Options for pagination
      const options = {
          page: parseInt(page, 10),   // Convert page to integer
          limit: parseInt(limit, 10), // Convert limit to integer
          sort: { createdAt: -1 },     // Sort by most recent users
          /* populate: {
              path: 'materialID',          // Populate the 'tests' field
          }*/
      };


      // Paginate GRNs array
      const result = await grnModel.paginate(filter, options);

      return res.status(200).json({
          status: 200,
          message: 'List of grns ',
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
    }
  } catch (error) {
      return res.status(500).json({ status:500, error: error.message });
  }
};





export const listGRNSampleSelected = async (req, res) => {
  try {
      const { page = 1, limit = 10, materialID, id, excel } = req.body;
      const {selectedRole,sapID,location,uID,loginPersonName} = req.encodedUser;
      const filter = {};

      if (selectedRole == 'admin') {
      }else if (selectedRole == 'EE (STORE)' || selectedRole == 'AE (STORE)' || selectedRole == 'SE (STORE)' ) {
          filter.uID = uID;
      }else if (selectedRole === "DQC") {
          filter.discom = location;
          // filter.materialName = { $nin: [/Transformer/i, /Meter/i] }; // Exclude Transformer and Meter
      } else if (selectedRole === "UQC") {
          //filter.materialName = { $in: [/Meter/i, /Transformer/i] }; // Include Meter or Transformer
         // filter.showToUQC = 1; 
      
          filter.associatedTags = { $in: [/Meter/i, /Transformer/i] }; // Include Meter or Transformer
          filter.showToUQC = 1; 
 
        }
      filter.sampleSelectedFromIt = { $eq: 1 };
      if (materialID) filter.di = materialID;
      if (id) filter._id = new mongoose.Types.ObjectId(id);
     
      
      if (excel == 1){

        const paginatedRecords = await grnModel.find(filter);
        const transformedData = paginatedRecords.map(record => {
          return {
              di: record.di,
              Line_NO: record.Line_NO,
              Contract_No: record.Contract_No,
              materialName: record.materialName,
              materialCode: record.materialCode,
              Mat_Group: record.Mat_Group,
              totalQuantityLineNo: record.totalQuantityLineNo,
              receiveMaterailList: record.receiveMaterailList,
              receiveDate: record.receiveDate,
              quantity: record.quantity,
          };
      });
  
      const headers = [
          { id: 'di', title: 'di' },
          { id: 'Line_NO', title: 'Line_NO' },
          { id: 'Contract_No', title: 'Contract_No' },
          { id: 'materialName', title: 'materialName' },
          { id: 'materialCode', title: 'materialCode' },
          { id: 'Mat_Group', title: 'Mat_Group' },
          { id: 'totalQuantityLineNo', title: 'Quantity' },
          { id: 'receiveDate', title: 'receiveDate' },
          { id: 'quantity', title: 'Quantity receive' },
          { id: 'receiveMaterailList', title: 'receiveMaterailList' },
      ];
  
      const csvWriter = createObjectCsvWriter({
          path: 'output.csv', // This should be dynamically generated or managed
          header: headers
      });
  
      csvWriter
          .writeRecords(transformedData)
          .then(() => {
              res.download('output.csv', 'output.csv', (err) => {
                  if (err) {
                      console.error('Error downloading the file:', err);
                      res.sendStatus(500);
                  } else {
                      console.log('File downloaded successfully');
                  }
              });
          })
          .catch((err) => {
              console.error('Error writing CSV file:', err);
              res.sendStatus(500);
          });


      }else{
      
      // Options for pagination
      const options = {
          page: parseInt(page, 10),   // Convert page to integer
          limit: parseInt(limit, 10), // Convert limit to integer
          sort: { createdAt: -1 },     // Sort by most recent users
          /* populate: {
              path: 'materialID',          // Populate the 'tests' field
          }*/
      };


      // Paginate GRNs array
      const result = await grnModel.paginate(filter, options);

      return res.status(200).json({
          status: 200,
          message: 'List of grns ',
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
    }
  } catch (error) {
      return res.status(500).json({ status:500, error: error.message });
  }
};


