import axios from "axios";
import { FaUser, FaBuilding } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { apiUrl, dateFormat } from "../constant/constant";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import switchAnimation from "../assets/switch.json";

function Topbar({ setActivePage, selectedMenu }) {
  const [activeRole, setActiveRole] = useState("");
  const [activeOffice, setActiveOffice] = useState("");
  const [notification, setNotification] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const storedToken = localStorage.getItem("token");

  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem("Quality_Cell_Data"));

    setActiveRole(localData?.role?.role);
    setActiveOffice(localData?.role?.office);
  }, [selectedMenu]);
  useEffect(() => {
    if (storedToken && storedToken !== "") {
      fetchNotification(storedToken);
    }
  }, [storedToken]);

  const fetchNotification = (token) => {
    const data = {
      page: 1,
      limit: 25,
    };
    axios
      .post(`${apiUrl}list-notification`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setNotification(response.data.data.docs);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const changeRole = () => {
    var localData = localStorage.getItem("Quality_Cell_Data");
    localData = JSON.parse(localData);
    delete localData.role;
    localStorage.setItem("Quality_Cell_Data", JSON.stringify(localData));
    // Navigate to the office home page and reload the page
    navigate("/roleselection");
  };
  return (
    <div
      className="d-flex top-bar pt-3 pb-2 mb-3 border-bottom px-2"
      style={{ backgroundColor: "#DDD" }}
    >
      <h1 className="h2" style={{ color: "#581c87" }}>
        UPPCL
      </h1>
      <div className="ms-auto flex-row d-flex">
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-primary rounded-circle me-3"
            style={{ backgroundColor: "#581c87" }}
            onClick={() => setActivePage("/notificationList")}
          >
            <i className="bi bi-bell-fill"></i>
          </button>
          <span className="badge bg-danger rounded-circle noteBadge">
            {notification.length > 9 ? "9+" : notification.length}
          </span>
          {open && (
            <ul className="notification">
              {notification.slice(0, 5).map((note) => (
                <li
                  key={note._id}
                  onClick={() => {
                    setActivePage("/notification");
                    localStorage.setItem("notification", JSON.stringify(note));
                    setOpen(false);
                  }}
                >
                  {note.title}
                  <p>{dateFormat(note.createdAt)}</p>
                </li>
              ))}
              {notification.length > 5 && (
                <li onClick={() => setActivePage("/notificationList")}>
                  View all notifications
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="d-flex flex-wrap">
          {/* The user icon */}
          <div
            className="d-flex flex-column align-items-center"
            style={{ color: "#581c87" }}
          >
            <div className="d-flex align-items-center">
              <FaUser className="me-2" />
              {/* The user role */}
              <p className="text-nowrap m-0">{activeRole.displayName}</p>
            </div>
            <div className="d-flex align-items-center">
              {/* The building icon */}
              <FaBuilding className="mx-2" />
              {/* The office name */}
              <p className="text-nowrap m-0">{activeOffice.name}</p>
            </div>
          </div>
          {/* The change office button */}
          <div className="d-flex cursor-pointer">
            <Lottie
              onClick={changeRole}
              animationData={switchAnimation}
              loop={true}
              style={{ height: "40px", width: "60px" }}
            />
          </div>
        </div>

        {/* <Dropdown align="end">
          <Dropdown.Toggle
            variant="success"
            className="text-capitalize"
            id="dropdown-custom-components"
          >
            <i className="bi bi-person-circle"></i> {activeOffice.name}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="/roleselection">Switch Account</Dropdown.Item>
            <Dropdown.Item href="#">Change Password</Dropdown.Item>
            <Dropdown.Item href="#">Profile</Dropdown.Item>
            <Dropdown.Item onClick={() => console.log("Logging out...")}>
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown> */}
      </div>
    </div>
  );
}
export default Topbar;
