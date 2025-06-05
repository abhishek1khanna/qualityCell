import express from "express";
import fs from "fs";
import axios from "axios";
import {
  registerController,
  loginController,
  listUsers,
  updateUserController,
  deleteUserController,
  getOTPController,
  mobileLoginController,
  logoutController,
  changePasswordController,
  fetchUserPermissions,
} from "../controllers/userController.js";

import {
  addSample,
  editSample,
  deleteSample,
  getAllSample,
  addSealingDetails,
  editSealingDetails,
  deleteSealingDetails,
  listSealingDetails,
  manageTeamMembers,
   manageItems,
  managePostTestAction,
  manageFeePayment
} from "../controllers/sampleController.js";


import { isAuth } from "../middleware/isAuth.js";

import multer from "multer";
import path from "path";
import { manageTests } from "../controllers/testMasterController.js";
import { addMaterial, editMaterial,deleteMaterial,getAllMaterials, managePostTestsAction } from "../controllers/materialController.js";
import { addTeamMember, editTeamMember,listTeamMembers,deleteTeamMember, notifyTeamMember } from "../controllers/sampleTeamController.js";
import { createSamples, listSamples,deleteSampleByItemID, showToUQCController, addExtraTestToSamples, preSampleSelect, groupSamples } from "../controllers/createSamplesController.js";
import { addSeal, updateSeal,listSeal,deleteSeal,manageFeesPayment , manageItemsSent,manageItemsReceive, manageTestResults, updateTestResultsForSamples, displayMaterialSelected, requestdDisplayMaterialSelected, manageItemsSentCheck, selectFinalDispatch, getMaterialSamplingReport } from "../controllers/sealController.js";

import { addGRN, updateGRN,deleteGRN,listGRN,getGRN, listGRNSampleNotSelected, listGRNSampleSelected } from "../controllers/grnController.js";


import { createRole, deleteRole, getAllRoles, updateRole } from "../controllers/rolesController.js";
import { validateToken } from "../utils/util.js";
import { sendData } from "../controllers/erpController.js";
import { manageLabs } from "../controllers/labController.js";
import { manageCategory } from "../controllers/categoryController.js";
import { deleteNotification, listNotifications, listNotificationsTeamMember, markNotificationRead } from "../controllers/notificationController.js";
import { generateMaterialReport } from "../controllers/reportController.js";


const rbacserver = "http://rbacserver:80";
const __dirname = path.resolve(path.dirname(""));

// const upload = multer({ dest: 'uploads/' });


// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      // const sampleId = req.body.di;
      const uploadPath = path.join(__dirname, "./uploads");
      // const uploadPath = path.join(__dirname, "./uploads", sampleId);
      console.log(uploadPath);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }); // Creates the folder and parent folders if necessary
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|mp4|mpeg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
      return cb(null, true);
  } else {
      cb(new Error('Only images and document files are allowed'));
  }
};

// Initialize Multer
export const upload = multer({ storage, fileFilter });
// export const upload =  multer({ dest: 'uploads/' });





const router = express.Router();


router.post("/auth", [validateToken], async (request, response) => {
  try {
    // using destructuring to create sapID property
    const sapID = request.body.requesterID;
    const token = request.headers.authorization.split(' ')[1];

    var { data: authDetails } = await axios.post(
      rbacserver + "/general/auth",
      {
        sapID: sapID,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(authDetails);
    if (authDetails.status !== 200) {
      // actionSapID does not exist in erp.
      return response.json({
        status: 202,
        message: authDetails.message,
      });
    }

    //returning OK response
    return response.json({
      status: 200,
      name: authDetails.name,
      sapID: authDetails.sapID,
      authorizationAreas: authDetails.authorizationAreas,
      token: token,
    });
  } catch (error) {
    // Handle error
    console.log("Error : ", error);
    return response.json({
      status: 500,
      message: "Internal Server Error.",
    });
  }
});


router.post("/auth1",  async (request, response) => {
  try {
    // using destructuring to create sapID property
    const sapID = request.body.requesterID;
    // const token = request.headers.authorization.split(' ')[1];
    console.log('rbacserver', rbacserver, sapID);
    var rbcaRes = await axios.post(
      rbacserver + "/general/auth",
      {
        sapID: sapID,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log('aaa', rbcaRes.data.authDetails.status);
    console.log('bbb', rbcaRes.authDetails.status);
    console.log('cccc', rbcaRes);

    if (authDetails.status !== 200) {
      // actionSapID does not exist in erp.
      return response.json({
        status: 202,
        message: authDetails.message,
      });
    }

    //returning OK response
    return response.json({
      status: 200,
      name: authDetails.name,
      sapID: authDetails.sapID,
      authorizationAreas: authDetails.authorizationAreas,
      token: token,
    });
  } catch (error) {
    // Handle error
    console.log("Error : ", error);
    return response.json({
      status: 500,
      message: "Internal Server Error.",
    });
  }
});

router.post("/get-user-permissions", fetchUserPermissions);


router.post("/get-otp", getOTPController);
router.post("/mobile-login", mobileLoginController);
router.post("/web-login", loginController);
router.post("/logout", isAuth, logoutController);
router.post('/change-password',   isAuth, changePasswordController);
router.post("/register", isAuth, registerController);
router.post("/user-list", isAuth, listUsers);
router.put("/user-update", isAuth, updateUserController);
router.delete("/softdelete-user", isAuth, deleteUserController);

router.post('/manageTests', isAuth, manageTests);
router.post('/manageLabs', isAuth, manageLabs);
router.post('/manageCategory', isAuth, manageCategory);




router.post('/get-roles', isAuth, getAllRoles);
router.post('/add-role', isAuth, createRole);
router.put('/update-role', isAuth, updateRole);
router.delete('/delete-role', isAuth, deleteRole);



router.post("/add-sample", isAuth, addSample);

router.put("/edit-sample",  isAuth,editSample);
// router.delete("/delete-sample", isAuth, deleteSample);
router.post("/get-all-sample", isAuth, getAllSample);


router.post("/get-grn", getGRN);
router.post("/add-grn", isAuth,addGRN);
router.put("/update-grn", isAuth,updateGRN);
router.delete("/delete-grn", isAuth,deleteGRN);
router.post("/list-grn", isAuth,listGRN);
router.post("/list-grn-samples-not-selected", isAuth,listGRNSampleNotSelected);
router.post("/list-grn-samples-selected", isAuth,listGRNSampleSelected);



router.post("/list-notification", isAuth,listNotifications);
router.post("/list-notification-team", isAuth,listNotificationsTeamMember);


router.delete("/delete-notification", isAuth,deleteNotification);
router.put("/read-notification", isAuth,markNotificationRead);



router.post("/add-team", isAuth,addTeamMember);

router.post("/notify-team", isAuth,notifyTeamMember);


router.put("/update-team", isAuth,editTeamMember);
router.delete("/delete-team", isAuth,deleteTeamMember);
router.post("/list-team", isAuth,listTeamMembers);


router.post("/create-sample", isAuth,createSamples);



router.post("/pre-create-sample", isAuth,preSampleSelect);


router.post("/add-extra-test", isAuth,addExtraTestToSamples);



router.post("/material-report", isAuth,getMaterialSamplingReport);


router.post("/show-to-uqc", isAuth,showToUQCController);

router.post("/display-material-selected", isAuth,displayMaterialSelected);
router.post("/request-material-selected", isAuth,requestdDisplayMaterialSelected);



router.post("/group-sample", isAuth,groupSamples);

router.post("/list-sample", isAuth,listSamples);
router.delete("/delete-sample", isAuth,deleteSampleByItemID);

router.post("/create-seal",  isAuth,  upload.fields([
  { name: 'photographs', maxCount: 10 },            // Allow up to 10 files for uploadNotice
  { name: 'video', maxCount: 10 },
]), addSeal);



router.put("/update-seal",
  upload.fields([
    { name: 'photographs', maxCount: 10 },            // Allow up to 10 files for uploadNotice
    { name: 'video', maxCount: 10 },
]), isAuth,updateSeal);

router.post("/list-seal", isAuth,listSeal);
router.delete("/delete-seal", isAuth,deleteSeal);


router.post("/manage-Fees-Payment", isAuth,manageFeesPayment);

router.post("/manage-Item-Send-check", isAuth,manageItemsSentCheck); 


router.post("/selected-for-dispatch", isAuth,selectFinalDispatch);

router.post("/manage-Item-Send", isAuth,manageItemsSent);
router.post("/manage-Item-Receive", isAuth,manageItemsReceive);
router.post("/manage-Test-Result", isAuth,manageTestResults);

router.post("/update-test-result", isAuth,updateTestResultsForSamples);

router.post("/generate-material-report",isAuth,  generateMaterialReport);



// Sealing Details Routes
/* router.post("/add-sealing-details",
  upload.fields([
    { name: 'photographs', maxCount: 10 },            // Allow up to 10 files for uploadNotice
    { name: 'video', maxCount: 10 },
]),
isAuth, addSealingDetails);

router.put("/edit-sealing-details", 
  upload.fields([
    { name: 'photographs', maxCount: 10 },            // Allow up to 10 files for uploadNotice
    { name: 'video', maxCount: 10 },
  ]),
  isAuth, editSealingDetails); */

router.delete("/delete-sealing-details", isAuth, deleteSealingDetails);
router.post("/list-sealing-details", isAuth, listSealingDetails);

// router.post("/manage-team-members", isAuth, manageTeamMembers);
// router.post("/manage-fee-payment", isAuth, manageFeePayment);
// router.post("/manage-test-results", isAuth, manageTestResults);
router.post("/manage-items", isAuth, manageItems);
// router.post("/manage-post-test-action", managePostTestAction);

router.post("/send-data",  sendData);

router.post("/add-material", isAuth, addMaterial);
router.put("/update-material", isAuth, editMaterial);
router.delete("/delete-material", isAuth, deleteMaterial);
router.post("/list-material", isAuth, getAllMaterials);


router.post(
  '/manage-post-test-action',
  upload.fields([
      { name: 'uploadNotice', maxCount: 10 },            // Allow up to 10 files for uploadNotice
      { name: 'uploadOMFinancialPenalty', maxCount: 10 },
      { name: 'uploadOMDebarment', maxCount: 10 }
  ]),
  isAuth, managePostTestsAction
);






export default router;
