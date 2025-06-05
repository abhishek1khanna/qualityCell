import { FaUser, FaBuilding } from "react-icons/fa";
import Lottie from "lottie-react";
import switchAnimation from "../assets/switch.json";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function RoleChange() {
  const [activeRole, setActiveRole] = useState("");
  const [activeOffice, setActiveOffice] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    var localData = JSON.parse(localStorage.getItem("Quality_Cell_Data"));
    setActiveRole(localData?.role?.role);
    setActiveOffice(localData?.role?.office);
  }, []);

  const changeRole = () => {
    var localData = localStorage.getItem("Quality_Cell_Data");
    localData = JSON.parse(localData);
    delete localData.role;
    localStorage.setItem("Quality_Cell_Data", JSON.stringify(localData));
    // Navigate to the office home page and reload the page
    navigate("/roleselection");
  };
  return (
    <div className="flex flex-wrap p-2 items-center">
      {/* The user icon */}
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          <FaUser className="mr-2" />
          {/* The user role */}
          <h2 className="whitespace-nowrap  p-1 text-sm self-center font-bold font-sans-ui-serif text-purple-800">
            {activeRole.displayName}
          </h2>
        </div>
        <div className="flex items-center">
          {/* The building icon */}
          <FaBuilding className="mx-2" />
          {/* The office name */}
          <h2 className="whitespace-nowrap p-1 text-sm self-center font-bold font-sans-ui-serif text-purple-800">
            {activeOffice.name}
          </h2>
        </div>
      </div>
      {/* The change office button */}
      <div className="flex cursor-pointer" onClick={changeRole}>
        <Lottie
          animationData={switchAnimation}
          loop={true}
          style={{ height: "40px", width: "60px" }}
        />
      </div>
    </div>
  );
}
