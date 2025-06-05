import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
function Layout({ children, setActivePage, selectedMenu }) {
  const title = (text) => {
    text = text.replace("/", "").replace(/([A-Z])/g, " $1");
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar setActivePage={setActivePage} selectedMenu={selectedMenu} />
        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-0">
          <Topbar setActivePage={setActivePage} selectedMenu={selectedMenu} />
          {/* Page Content */}
          <div className="container mt-4">
            <div className="card shadow">
              <div
                className="card-header"
                style={{
                  background: "linear-gradient(to right, #2c3e50, #f39c12)",
                }}
              >
                <h4 className="mb-0 text-white">{title(selectedMenu)}</h4>
              </div>
              <div
                className="card-body"
                style={{
                  overflowY: "auto", // Enable vertical scrolling
                  height: "71vh",
                  scrollbarWidth: "thin",
                }}
              >
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
export default Layout;
