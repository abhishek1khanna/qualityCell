import React, { useState } from "react";

const ProgressBar = ({ uploadPercentage = 0 }) => {
  return (
    <div style={{ width: "400px", margin: "20px auto" }}>
      {uploadPercentage > 0 && (
        <div
          style={{ marginTop: "10px", width: "100%", backgroundColor: "#ccc" }}
        >
          <div
            style={{
              width: `${uploadPercentage}%`,
              backgroundColor: "green",
              color: "white",
              textAlign: "center",
            }}
          >
            {uploadPercentage}%
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProgressBar);
