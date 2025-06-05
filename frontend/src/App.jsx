import { Route, Routes } from "react-router-dom";
import OfficeRoleSelection from "./pages/private/OfficeRoleSelection";
import HomePage from "./pages/private/Home";
import { useEffect, useState } from "react";
import { Bars } from "react-loading-icons";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import axios from "axios";
import { ApiResponse } from "./constant/ApiResponse";
import { AppProvider } from "./utils/userContext";

function App() {
  const [currentUser, setLogin] = useState(null);
  useEffect(() => {
    /* const localData = localStorage.getItem("Quality_Cell_Data");
    console.log(JSON.parse(localData));
    localStorage.setItem("Quality_Cell_Data", JSON.stringify(ApiResponse));
    setLogin(ApiResponse); */
    if (window.self !== window.top) {
      const url = new URL(window.location.href);
      //console.log(url);
      const token = url.searchParams.get("token");
      //console.log(token);
      const data = {};
      if (token) {
        // var token1 =
        //   "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzYXBJRCI6MTEwMDAzNDIsInR5cGUiOiJPRkZJQ0VSIiwiaWF0IjoxNzE2MDE3NTM2LCJleHAiOjE3MjM3OTM1MzYsImF1ZCI6Ik9GRklDRVIiLCJpc3MiOiJVUFBDTCIsInN1YiI6IlVBIn0.IGgNJFx3p5cDaN1YAmRLM3gFElRezYycCOKzPzZuegR_JRwnRczc3CPUI3kQRnmrGi0HH17tGrDdtZyWxQFMMtRs_7fZPO8Et4dYO9YNi9VFr7VxH_QuSaaMYTuHpHMJgd662X1CWR0dtrgHamsz9GcQjkNPMV7LMYKVe7MAsx7C20QoB0p_wXYP2_s7-qvYiIND8gh0BxcwZEbMVKr-SAyEZJG8kphLL55CN161xjHd4unSXISS5XhYbqn5jwuJWLqyl3HPz533-GHscEGKGXM7Pb5k4oTgtTtGZW9f7zT-zhjGu7IppvbljK3Ff0qZjKnleGxODJdeTC3FZieJ9Q";
        axios
          .post("https://devops1.uppcl.org/qualitycell/api/auth", data, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            console.log(res.data);
            if (res.data.status === 200) {
              const auth = res.data.authorizationAreas.filter(
                (auth) =>
                  auth.area.role.role === "UPPCL_AE_STORE" ||
                  auth.area.role.role === "UPPCL_UQC_UPPCL" ||
                  auth.area.role.role === "UPPCL_SEMM_DISCOM" ||
                  auth.area.role.role === "UPPCL_DQC_DISCOM" ||
                  auth.area.role.role === "UPPCL_DIRD_UPPCL" ||
                  auth.area.role.role === "UPPCL_DIRT_DISCOM" ||
                  auth.area.role.role === "UPPCL_SESTORE_DISCOM" ||
                  auth.area.role.role === "UPPCL_EE_STORE" ||
                  auth.area.role.role === "REPORT"
              );
              let data = res.data;
              data.authorizationAreas = auth;

              localStorage.setItem("Quality_Cell_Data", JSON.stringify(data));
              setLogin(data);
            } else {
              localStorage.removeItem("Quality_Cell_Data");
              console.log(res.data.message);
              Swal.fire({
                text: res.data.message,
                icon: "error",
                //dangerMode: true,
              }).then((result) => {
                console.log(result);
                if (result.isConfirmed) {
                  window.close();
                }
              });
            }
          })
          .catch((error) => {
            console.error(error.message);
            Swal.fire({
              text: "Network Error.",
              icon: "error",
              showCancelButton: false,
              confirmButtonText: "Close",
            }).then((result) => {
              if (result.isConfirmed) {
                window.close();
              }
            });
          });
      } else {
        Swal.fire({
          text: "Please login through Single Sign on to continue.",
          icon: "error",
        }).then((result) => {
          if (result) {
            window.close();
          }
        });
        //setLogin(false);
      }
    } else {
      Swal.fire({
        text: "Please login through Single Sign on to continue.",
        icon: "error",
      }).then((result) => {
        if (result) {
          window.close();
        }
      });
    }
  }, []);

  function RenderRoute(props) {
    const { currentUser, page } = props;
    //console.log("page:", page);
    if (currentUser !== null) {
      //console.log(currentUser);
      switch (page) {
        case "roleselection":
          return <OfficeRoleSelection data={currentUser} />;
        case "home":
          return <HomePage currentOfficer={currentUser} />;
        default:
          return <OfficeRoleSelection data={currentUser} />;
      }
    } else {
      return (
        <div className="d-flex flex-column min-vh-100">
          <Bars className="m-auto" stroke="#9333ea" fill="#9333ea" />
        </div>
      );
    }
  }
  return (
    <AppProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, type: "spring" }}
        className="min-vh-100"
      >
        <Routes>
          <Route path="/" element={<RenderRoute currentUser={currentUser} />} />
          <Route
            path="/roleselection"
            element={
              <RenderRoute currentUser={currentUser} page={"roleselection"} />
            }
          />
          <Route
            path="/home"
            element={<RenderRoute currentUser={currentUser} page={"home"} />}
          />
          <Route path="*" element={<RenderRoute currentUser={currentUser} />} />
          {/* <Route
          path="/"
          element={
            <>
              <PageTitle title="Add Material | Quality Cell" />
              <AddMaterialForm />
            </>
          }
        /> 
        <Route
          path="/view-materials"
          element={
            <>
              <PageTitle title="View Material | Quality Cell" />
              <ViewMaterials />
            </>
          }
        />
        <Route
          path="/add-test-result"
          element={
            <>
              <PageTitle title="Add Test Result | Quality Cell" />
              <AddTestResult />
            </>
          }
        />
        <Route
          path="/test-results"
          element={
            <>
              <PageTitle title="Test Result | Quality Cell" />
              <TestResults />
            </>
          }
        />
        <Route
          path="/add-to-store"
          element={
            <>
              <PageTitle title="Add To Store | Quality Cell" />
              <AddToStore />
            </>
          }
        />
        <Route
          path="/view-stored-materials"
          element={
            <>
              <PageTitle title="View Stored Materials | Quality Cell" />
              <ViewStoredMaterials />
            </>
          }
        />
        <Route
          path="/add-sample-details"
          element={
            <>
              <PageTitle title="Add Sample Details | Quality Cell" />
              <AddSampleDetails />
            </>
          }
        />
        <Route
          path="/add-sample-bill"
          element={
            <>
              <PageTitle title="Add Sample Bill | Quality Cell" />
              <AddSampleBill />
            </>
          }
        />
        <Route
          path="/add-test-results"
          element={
            <>
              <PageTitle title="Add Test Results | Quality Cell" />
              <AddTestResults />
            </>
          }
        />
        <Route
          path="/create-sampling-team"
          element={
            <>
              <PageTitle title="Add Sampling Team | Quality Cell" />
              <CreateSamplingTeam />
            </>
          }
        />
        <Route
          path="/*"
          element={
            <>
              <PageTitle title="Page Not Fount | Quality Cell" />
              <h3 className="text-center">Page Not Found(404)</h3>
            </>
          }
        />*/}
        </Routes>
      </motion.div>
    </AppProvider>
  );
}

export default App;
