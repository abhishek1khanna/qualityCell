import { ThreeDots } from "react-loading-icons";
import Lottie from "lottie-react";
import RoleTile from "../../component/RoleTile";
import selectAnimation from "../../assets/select.json";
import { motion } from "framer-motion";
export default function OfficeRoleSelection({ data }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div
        className="position-sticky top-0 "
        style={{ zIndex: "1000", backgroundColor: "#e5e7eb" }}
      >
        <div className="d-flex flex-wrap align-items-center p-2 justify-content-end">
          <div
            className="text-nowrap flex-grow-1 text-center p-1 fs-md-3 align-self-center fw-bold font-sans-serif"
            style={{ color: "#581c87", fontSize: "1.5rem", lineHeight: "2rem" }}
          >
            Quality Cell Portal
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, type: "spring" }}
        className="d-flex flex-column p-2 flex-grow-1"
      >
        {data ? (
          <main className="h-100" style={{ backgroundColor: "#F4F4F4" }}>
            {/* The content section */}
            <div className="d-flex flex-column mx-4 py-4 px-4 align-items-center">
              {/* The title for the content section */}
              <div className="d-flex flex-row align-items-center justify-content-start">
                <h1
                  className="mb-4 position-relative text-nowrap"
                  style={{
                    fontSize: "1.5rem",
                    lineHeight: "2rem",
                  }}
                >
                  Select an Office/Role:
                </h1>

                {/* The animation */}
                <div className="col-lg-2">
                  <Lottie animationData={selectAnimation} loop={true} />
                </div>
              </div>
              <div className="d-flex flex-wrap gap-4 justify-content-center">
                {/* Map over the data array to generate RoleTile components */}
                {data.authorizationAreas.map((obj, index) => (
                  <RoleTile
                    key={obj.area.role.uID + "-" + index}
                    area={obj.area}
                  />
                ))}
              </div>
            </div>
          </main>
        ) : (
          <div className="d-flex justify-content-center align-items-center min-vh-100">
            <ThreeDots className="" stroke="#9333ea" fill="#9333ea" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
