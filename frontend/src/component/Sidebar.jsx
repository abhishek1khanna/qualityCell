import { use } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ setActivePage, selectedMenu }) {
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? "active" : "");
  const [userPermission, setUserPermission] = useState(null);
  const [dashboardMenu, setDashboardMenu] = useState(null);
  const [materialMenu, setMaterialMenu] = useState(null);
  const [storeMenu, setStoreMenu] = useState(null);
  const [qualityMenu, setQualityMenu] = useState(null);
  const [mastersMenu, setMastersMenu] = useState(null);
  const userInfo = localStorage.getItem("userPermission");
  useEffect(() => {
    if (userInfo) {
      setUserPermission(JSON.parse(userInfo));
    } else {
      console.log("User Permission not found");
    }
  }, [userInfo]);
  useEffect(() => {
    if (userPermission) {
      setMaterialMenu(
        userPermission.filter((item) =>
          ["Add DI", "View DI", "Add Post Test Result"].includes(item.section)
        )
      );
      setDashboardMenu(
        userPermission.filter((item) => ["Dashboard"].includes(item.section))
      );

      setStoreMenu(
        userPermission.filter((item) =>
          [
            "Add Receipt of Material",
            "View Receipt of Materials",
            "Sealing Details",
            "Testing Fee Details",
            "Add Dispatch Details",
            "Receipt Back Details",
            "Add Test Results",
            "View Selected Samples",
          ].includes(item.section)
        )
      );

      setQualityMenu(
        userPermission.filter((item) =>
          [
            "Create Sampling Team",
            "Sample Selection",
            "Material Received",
          ].includes(item.section)
        )
      );

      setMastersMenu(
        userPermission.filter((item) =>
          ["Test Master", "Labs", "Categories"].includes(item.section)
        )
      );
    }
  }, [userPermission]);
  const dashboardMenuRef = useRef(null);
  const materialMenuRef = useRef(null);
  const storeMenuRef = useRef(null);
  const qualityMenuRef = useRef(null);
  const mastersMenuRef = useRef(null);

  const menus = [
    { menu: dashboardMenu, ref: dashboardMenuRef },
    { menu: materialMenu, ref: materialMenuRef },
    { menu: storeMenu, ref: storeMenuRef },
    { menu: qualityMenu, ref: qualityMenuRef },
    { menu: mastersMenu, ref: mastersMenuRef },
  ];

  useEffect(() => {
    // Find the first visible menu and trigger the click
    for (let i = 0; i < menus.length; i++) {
      const { menu, ref } = menus[i];
      if (menu && ref.current && ref.current.offsetParent !== null) {
        // Trigger click on the first visible menu
        ref.current.click();
        break; // Skip triggering clicks on subsequent menus
      }
    }
  }, [dashboardMenu, materialMenu, storeMenu, qualityMenu, mastersMenu]);

  function convertToCamelCase(str) {
    return str
      .split(" ")
      .map((word, index) =>
        index === 0
          ? word.charAt(0).toLowerCase() + word.slice(1)
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  }
  return (
    <nav
      id="sidebarMenu"
      className="col-md-3 col-lg-2 d-md-block sidebar"
      style={{
        top: 0,
        left: 0,
        height: "100vh",
        background: "#2c3e50",
        color: "#fff",
        overflowY: "auto", // Enable vertical scrolling
        padding: "10px",
        scrollbarWidth: "thin",
      }}
    >
      {userPermission && (
        <div className="position-sticky pt-3">
          <h3 className="text-center py-3" style={{ color: "#FFF" }}>
            Quality Cell
          </h3>
          <ul className="nav flex-column">
            <li className="nav-item mb-3">
              {dashboardMenu &&
                dashboardMenu.filter((menu) => menu.actions).length > 0 && (
                  <Link
                    className={`nav-link text-white ${isActive("/dashboard")}`}
                    to="#"
                  >
                    <i className="bi bi-speedometer"></i> Dashboard
                  </Link>
                )}

              <ul className="nav flex-column ms-3">
                {dashboardMenu &&
                  dashboardMenu
                    .filter((menu) => menu.actions)
                    .map((menu, index) => (
                      <li className="nav-item" key={menu._id + "-" + index}>
                        <Link
                          ref={index === 0 ? dashboardMenuRef : null}
                          className={`nav-link text-white ${
                            selectedMenu ===
                              "/" + convertToCamelCase(menu.section) && "active"
                          }`}
                          onClick={() =>
                            setActivePage(
                              "/" + convertToCamelCase(menu.section)
                            )
                          }
                        >
                          {menu.section}
                        </Link>
                      </li>
                    ))}
              </ul>
            </li>

            <li className="nav-item mb-3">
              {materialMenu &&
                materialMenu.filter((menu) => menu.actions).length > 0 && (
                  <Link
                    className={`nav-link text-white ${isActive(
                      "/add-material"
                    )}`}
                    to="#"
                  >
                    <i className="bi bi-house-door"></i> Material Management
                  </Link>
                )}
              <ul className="nav flex-column ms-3">
                {materialMenu &&
                  materialMenu
                    .filter((menu) => menu.actions)
                    .map((menu, index) => (
                      <li className="nav-item" key={menu._id + "-" + index}>
                        <Link
                          ref={index === 0 ? materialMenuRef : null}
                          className={`nav-link text-white ${
                            selectedMenu ===
                              "/" + convertToCamelCase(menu.section) && "active"
                          }`}
                          onClick={() =>
                            setActivePage(
                              "/" + convertToCamelCase(menu.section)
                            )
                          }
                        >
                          {menu.section}
                        </Link>
                      </li>
                    ))}
              </ul>
            </li>

            {/* Store Unit */}
            <li className="nav-item mb-3">
              {storeMenu &&
                storeMenu.filter((menu) => menu.actions).length > 0 && (
                  <Link
                    className={`nav-link text-white ${isActive(
                      "/add-to-store"
                    )}`}
                    to="#"
                  >
                    <i className="bi bi-box"></i> Store Unit
                  </Link>
                )}
              <ul className="nav flex-column ms-3">
                {storeMenu &&
                  storeMenu
                    .filter((menu) => menu.actions)
                    .map((menu, index) => (
                      <li className="nav-item" key={menu._id + "-" + index}>
                        <Link
                          ref={index === 0 ? storeMenuRef : null}
                          className={`nav-link text-white ${
                            selectedMenu ===
                              "/" + convertToCamelCase(menu.section) && "active"
                          }`}
                          onClick={() =>
                            setActivePage(
                              "/" + convertToCamelCase(menu.section)
                            )
                          }
                        >
                          {menu.section}
                        </Link>
                      </li>
                    ))}
              </ul>
            </li>

            {/* Quality Cell */}
            <li className="nav-item mb-3">
              {qualityMenu &&
                qualityMenu.filter((menu) => menu.actions).length > 0 && (
                  <Link
                    className={`nav-link text-white ${isActive(
                      "/create-sampling-team"
                    )}`}
                    to="#"
                  >
                    <i className="bi bi-person"></i> Quality Cell
                  </Link>
                )}
              <ul className="nav flex-column ms-3">
                {qualityMenu &&
                  qualityMenu
                    .filter((menu) => menu.actions)
                    .map((menu, index) => (
                      <li className="nav-item" key={menu._id + "-" + index}>
                        <Link
                          ref={index === 0 ? qualityMenuRef : null}
                          className={`nav-link text-white ${
                            selectedMenu ===
                              "/" + convertToCamelCase(menu.section) && "active"
                          }`}
                          onClick={() =>
                            setActivePage(
                              "/" + convertToCamelCase(menu.section)
                            )
                          }
                        >
                          {menu.section}
                        </Link>
                      </li>
                    ))}
              </ul>
            </li>

            <li className="nav-item mb-3">
              {mastersMenu &&
                mastersMenu.filter((menu) => menu.actions).length > 0 && (
                  <Link
                    className={`nav-link text-white ${isActive(
                      "/create-sampling-team"
                    )}`}
                    to="#"
                  >
                    <i className="bi bi-laptop"></i> Masters
                  </Link>
                )}
              <ul className="nav flex-column ms-3">
                {mastersMenu &&
                  mastersMenu
                    .filter((menu) => menu.actions)
                    .map((menu, index) => (
                      <li
                        className="nav-item"
                        key={menu.section + "--" + index}
                      >
                        <Link
                          ref={index === 0 ? mastersMenuRef : null}
                          className={`nav-link text-white ${
                            selectedMenu ===
                              "/" + convertToCamelCase(menu.section) && "active"
                          }`}
                          onClick={() =>
                            setActivePage(
                              "/" + convertToCamelCase(menu.section)
                            )
                          }
                        >
                          {menu.section}
                        </Link>
                      </li>
                    ))}
              </ul>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Sidebar;
