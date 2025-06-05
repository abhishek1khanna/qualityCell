//import { SidebarData } from "../constants/SidebarData";
//import { HomeRoutes } from "../constants/Home_Routes";
import { useState } from "react";
import React from "react";
//import Sidebar from "../components/Sidebar";
import TopNavbar from "../../component/TopNavbar";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Layout from "../../component/layout";
import { HomeRoutes } from "../../constant/Home_Routes";
import axios from "axios";
import { apiUrl } from "../../constant/constant";
import { ThreeDots } from "react-loading-icons";
import Swal from "sweetalert2";
export default function HomePage({ currentOfficer }) {
  const [activePage, setActivePage] = useState("/addDI");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getUserPermissions();
  }, []);
  function getUserPermissions() {
    setIsLoading(true);
    let userData = localStorage.getItem("Quality_Cell_Data");
    userData = JSON.parse(userData);
    console.log("userData", userData);
    const data = {
      selectedRole: userData?.role?.role?.role,
      sapID: userData?.sapID,
      location: userData?.role.office?.name,
      loginPersonName: userData?.role.role?.displayName,
      uID: userData?.role?.office?.uID,
    };

    axios
      .post(`${apiUrl}get-user-permissions`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response);
        if (response?.data?.token) {
          localStorage.setItem("token", response?.data?.token);
          localStorage.setItem(
            "userPermission",
            JSON.stringify(response?.data?.permissions)
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        }
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, type: "spring" }}
      >
        <Layout selectedMenu={activePage} setActivePage={setActivePage}>
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
              <ThreeDots className="" stroke="#9333ea" fill="#9333ea" />
            </div>
          ) : (
            <HomeRoutes selectedMenu={activePage} />
          )}
        </Layout>
      </motion.div>
    </>
  );
}
