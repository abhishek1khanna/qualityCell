import { useNavigate } from "react-router-dom";
import OfficeTile from "./OfficeTile";
import { useState } from "react";
export default function RoleTile({ area }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const saveRole = () => {
    var localData = localStorage.getItem("Quality_Cell_Data");
    localData = JSON.parse(localData);
    localData.role = area;
    localStorage.setItem("Quality_Cell_Data", JSON.stringify(localData));
    navigate("/home");
  };

  return (
    <div
      className="p-4 my-2 shadow"
      style={{
        width: "18rem",
        transform: hover ? "scale(1.05)" : "scale(1)",
        boxShadow: hover ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "",
        transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
        cursor: "pointer",
        borderRadius: ".5rem",
        backgroundColor: "#f3f4f6",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => saveRole()}
    >
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ minHeight: "65px" }}
      >
        {/* The role name */}
        <div
          className="fw-bold font-sans-serif"
          style={{ color: "#581c87", fontSize: "1.25rem", lineHeight: "2rem" }}
        >
          {area.role.displayName}
        </div>

        {/* The button to select the role */}
        <button className="btn btn-primary d-none text-white rounded-lg btn-sm">
          Select Role
        </button>
      </div>

      {/* The list of offices */}
      <div className="d-flex flex-column">
        <OfficeTile key={area.office.uID} area={area} />
      </div>
    </div>
  );
}
