import React from "react";
import { motion } from "framer-motion";
import TestResults from "../pages/private/TestResult";
import AddTestResults from "../pages/private/AddTestResults";
import CreateSamplingTeam from "../pages/private/CreateSamplingTeam";
import AddDispatchedDetails from "../pages/private/AddDispatchedDetails";
import TestMaster from "../pages/private/TestMaster";
import AddDI from "../pages/private/AddDI";
import ViewDI from "../pages/private/ViewDI";
import AddPostTestResult from "../pages/private/AddPostTestResult";
import ViewReceiptOfMaterials from "../pages/private/ViewReceiptOfMaterial";
import TestingFeeDetails from "../pages/private/TestingFeeDetails";
import AddReceiptOfMaterial from "../pages/private/AddReceiptOfMaterial";
import SampleSelection from "../pages/private/SampleSelection";
import SealingDetails from "../pages/private/SealingDetails";
import MaterialReceived from "../pages/private/MaterialReceived";
import ReceiptBackDetails from "../pages/private/ReceiptBackDetails";
import ViewSelectedSample from "../pages/private/ViewSelectedSample";
import TestCategory from "../pages/private/TestCategory";
import Labs from "../pages/private/Labs";
import NotificationDetail from "../pages/private/NotificationDetail";
import NotificationList from "../pages/private/NotificationList";
import Dashboard from "../pages/private/Dashboard";

export function HomeRoutes({ selectedMenu }) {
  switch (selectedMenu) {
    case "/addDI":
      return <AddDI />;
    case "/viewDI":
      return <ViewDI />;
    case "/addPostTestResult":
      return <AddPostTestResult />;

    /* case "/viewAction":
      return <TestResults />;
 */
    case "/addReceiptOfMaterial":
      return <AddReceiptOfMaterial />;
    case "/viewReceiptOfMaterials":
      return <ViewReceiptOfMaterials />;
    case "/sealingDetails":
      return <SealingDetails />;
    case "/testingFeeDetails":
      return <TestingFeeDetails />;
    case "/addDispatchDetails":
      return <AddDispatchedDetails />;
    case "/receiptBackDetails":
      return <ReceiptBackDetails />;
    case "/addTestResults":
      return <AddTestResults />;
    case "/viewSelectedSamples":
      return <ViewSelectedSample />;
    case "/createSamplingTeam":
      return <CreateSamplingTeam />;
    case "/sampleSelection":
      return <SampleSelection />;
    case "/materialReceived":
      return <MaterialReceived />;
    case "/testMaster":
      return <TestMaster />;
    case "/categories":
      return <TestCategory />;
    case "/labs":
      return <Labs />;
    case "/notification":
      return <NotificationDetail />;
    case "/notificationList":
      return <NotificationList />;
    case "/dashboard":
      return <Dashboard />;

    default:
      return (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex justify-center w-full h-96"
        >
          <div>under construction</div>
        </motion.div>
      );
  }
}
