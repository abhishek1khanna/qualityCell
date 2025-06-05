import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../constant/constant";
import Swal from "sweetalert2";
import ListDownload from "../../component/ListDownload";
import ReceivedItem from "../../component/ReceivedItemsForm";
import Loader from "../../component/Loader";

function AddReceiptOfMaterial() {
  const [grnData, setGrnData] = useState(null);
  const [grnNo, setGrnNo] = useState("");
  const [year, setYear] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [token, setToken] = useState("");
  const [customReceivedMaterial, setCustomReceivedMaterial] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const location = JSON.parse(localStorage.getItem("Quality_Cell_Data"));
    console.log(location?.sapID);
    setToken(token);
  }, []);

  function getSample() {
    if (grnNo === "") {
      Swal.fire({
        icon: "warning",
        title: "Please enter GRN No. first",
      });
      return;
    }
    if (year === "") {
      Swal.fire({
        icon: "warning",
        title: "Please enter Year first",
      });
      return;
    }
    setIsLoading(true);
    const location = JSON.parse(localStorage.getItem("Quality_Cell_Data"));
    const data = {
      GRN_NO: grnNo,
      SAP_ID: location?.sapID,
      Year: year,
    };
    axios
      .post(`${apiUrl}get-grn`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response---:", response?.data?.data);
        const resData = response?.data;
        const grnData = resData?.data?.Data;
        if (grnData === null || grnData === undefined) {
          Swal.fire({
            icon: "error",
            title: "No Record Found",
            text: response?.data?.message,
          });
        } else {
          if (Array.isArray(grnData)) {
            setReadOnly(true);
            setGrnData(grnData);
          } else if (typeof grnData === "object" && grnData !== null) {
            if (grnData?.Status === "NA") {
              Swal.fire({
                icon: "error",
                title: "No Record Found",
                text: response?.data?.message,
              });
            } else {
              setReadOnly(true);
              setGrnData([grnData]);
              console.log("grnDataArray:", [grnData]);
            }
          } else {
            console.log("The grnData is neither an object nor an array.");
          }
          //
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formattedData = grnData.map((data) => {
      const filteredReceivedItems =
        customReceivedMaterial.length > 0
          ? transformData(customReceivedMaterial).filter(
              (item) => item.lineNo === data.DI_Line_Item
            )
          : [];

      // Calculate total received quantity for the line item
      const totalReceivedQuantity = filteredReceivedItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );

      // Ensure total received quantity matches DI_Qty (expected quantity)
      console.log("Total Received Quantity:", totalReceivedQuantity);
      const isValid = totalReceivedQuantity === Number(data.GRN_Qty);
      if (!isValid && customReceivedMaterial.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Quantity Mismatch!",
          confirmButtonText: "OK",
        });
      }

      return {
        di: data.DI_No,
        grnNo,
        year,
        quantity: data.GRN_Qty,
        materialName: data.Material_Description,
        Line_NO: data.DI_Line_Item,
        Contract_No: data.Contract_No,
        totalQuantityLineNo: data.DI_Qty,
        materialCode: data.Material_Code,
        receiveDate: changeDate(data.GRN_Date),
        receiveMaterailList: data.Serial_NO_List ? data.Serial_NO_List : [],
        Mat_Group: data?.Material_Group,
        plant: data.Plant_Code,
        plantName: data.Plant_Name,
        storeLocation: data.Storage_location,
        customReceivedMaterial: filteredReceivedItems,
      };
    });
    const data = {
      grnData: formattedData,
    };
    axios
      .post(`${apiUrl}add-grn`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        setReadOnly(false);
        console.log("Response:", response?.data);
        Swal.fire({
          icon: response?.data?.Data.length === 0 ? "error" : "success",
          title:
            response?.data?.Data.length === 0 ? "Already Exist" : "Success",
          text: response?.data?.message,
        });
        setGrnData(null);
        setGrnNo("");
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error?.response?.data?.details);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.details || "Something went wrong",
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };

  const diRef = useRef(null);
  const changeDate = (dateStr) => {
    const dateStr2 = dateStr.toString();
    return `${dateStr2.slice(0, 4)}-${dateStr2.slice(4, 6)}-${dateStr2.slice(
      6,
      8
    )}`;
  };
  const changeFormat = (dateStr) => {
    const dateStr2 = dateStr.toString();
    return `${dateStr2.slice(6, 8)}-${dateStr2.slice(4, 6)}-${dateStr2.slice(
      0,
      4
    )}`;
  };
  function receivedItems(newReceivedItems) {
    //console.log("Received Items:", newReceivedItems);

    setCustomReceivedMaterial((prev) => {
      // Create a copy of previous state
      let updatedReceivedMaterials = [...prev];

      newReceivedItems.forEach((item) => {
        // Find existing index by lineNo
        const index = updatedReceivedMaterials.findIndex(
          (mat) => mat.lineNo === item.lineNo
        );

        if (index !== -1) {
          // Update existing lineNo data
          updatedReceivedMaterials[index] = {
            ...updatedReceivedMaterials[index],
            items: [...(updatedReceivedMaterials[index].items || []), item],
          };
        } else {
          // Add new lineNo data
          updatedReceivedMaterials.push({
            lineNo: item.lineNo,
            items: [item],
          });
        }
      });

      return updatedReceivedMaterials;
    });
  }
  function transformData(data) {
    const result = [];

    data.forEach((group) => {
      group.items.forEach((item) => {
        if (item.name && item.quantity) {
          const existing = result.find(
            (entry) => entry.name === item.name && entry.lineNo === item.lineNo
          );

          if (!existing) {
            result.push({
              name: item.name,
              quantity: item.quantity,
              lineNo: item.lineNo,
            });
          } else {
            existing.quantity = item.quantity; // Keep the latest quantity
          }
        }
      });
    });

    return result;
  }
  /* console.log(
    "Custom Received Material:",
    transformData(customReceivedMaterial)
  ); */
  return (
    <form onSubmit={handleSubmit}>
      {isLoading && <Loader />}
      <div className="mb-3 row">
        <div className="col-md-5">
          <label htmlFor="di" className="form-label">
            GRN (Search from existing GRN or manually enter)
          </label>
          <input
            type="text"
            className="form-control"
            value={grnNo}
            onChange={(e) => setGrnNo(e.target.value)}
            placeholder="Enter GRN"
            required
            ref={diRef}
            readOnly={readOnly}
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="di" className="form-label">
            Select Year
          </label>
          <select
            className="form-control"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            disabled={readOnly}
          >
            <option value="" disabled>
              Select Year
            </option>
            {Array.from({ length: 50 }, (_, i) => {
              const yearOption = new Date().getFullYear() - i;
              return (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              );
            })}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="buttonReset" className="form-label d-block">
            &nbsp;
          </label>
          {readOnly ? (
            <button
              className="btn btn-warning"
              type="button"
              onClick={() => {
                setReadOnly(false);
                if (diRef.current) {
                  diRef.current.focus();
                }
                setGrnData([]);
              }}
            >
              Reset GRN
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={isLoading}
              type="button"
              onClick={() => {
                getSample();
              }}
            >
              Search
            </button>
          )}
        </div>
      </div>
      {readOnly && (
        <>
          {grnData.map((material, index) => (
            <div
              className="row mt-3 p-3"
              style={{
                backgroundColor: index % 2 === 0 ? "#F4F4F4" : "#ebe9e9",
              }}
              key={index}
            >
              <div className="col-lg-4">
                <p>
                  <strong>DI: </strong>
                  {material.DI_No}
                </p>
              </div>

              <div className="col-lg-4">
                <p>
                  <strong>GRN No.: </strong>
                  {grnNo}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Year: </strong>
                  {year}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Line No: </strong>
                  {material.DI_Line_Item}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Material Name: </strong>
                  {material.Material_Description}
                </p>
              </div>

              <div className="col-lg-4">
                <p>
                  <strong>Contract No: </strong>
                  {material.Contract_No}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Material Code: </strong>
                  {material.Material_Code}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Plant: </strong>
                  {material.Plant_Name} ({material.Plant_Code})
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Store Location: </strong>
                  {material.Storage_location}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Total Quantity (Line No): </strong>
                  {material.DI_Qty}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Received Quantity: </strong>
                  {material.GRN_Qty}
                </p>
              </div>

              <div className="col-lg-4">
                <p>
                  <strong>Receive Date: </strong>
                  {changeFormat(material.GRN_Date)}
                </p>
              </div>

              <div className="col-lg-12">
                <p>
                  <strong>Received Material List: </strong>
                </p>
                <ListDownload data={material} grnNo={grnNo} year={year} />

                {!material?.Serial_NO_List && (
                  <>
                    <p className="mt-3">
                      <strong>
                        Received material list is empty kindly add the
                        identifying particulars
                      </strong>
                    </p>
                    <ReceivedItem
                      data={receivedItems}
                      receivedQuantity={material.GRN_Qty}
                      lineNo={material.DI_Line_Item}
                    />
                  </>
                )}
              </div>
            </div>
          ))}

          {grnData && grnData.length > 0 ? (
            <div className="col-md-6">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                Add to Store
              </button>
            </div>
          ) : (
            <h4 className="text-center my-5">No record found</h4>
          )}
        </>
      )}
    </form>
  );
}

export default AddReceiptOfMaterial;
