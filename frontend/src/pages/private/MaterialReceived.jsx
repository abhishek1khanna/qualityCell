import axios from "axios";
import React, { useEffect, useState } from "react";
import { apiUrl, dateFormat, setDateFormat } from "../../constant/constant";
import ListDownload from "../../component/ListDownload";
import Pagination from "../../component/Pagination";
import Loader from "../../component/Loader";
import { useUserContext } from "../../utils/userContext";
import RecordLimit from "../../component/RecordLimit";

function MaterialReceived() {
  const { limit } = useUserContext();
  const [DIData, setDIData] = useState(null);
  const [receivedMaterialList, setReceivedMaterialList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleData = (data) => {
    setDIData(data);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("DI: ", DIData);
      getReceivedMaterial(token);
    } else {
      setReceivedMaterialList([]);
    }
  }, [DIData, currentPage, limit]);
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);
  const getReceivedMaterial = (token) => {
    setIsLoading(true);
    const data = {
      materialID: "",
      page: currentPage,
      limit: limit,
    };
    axios
      .post(`${apiUrl}list-grn`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        setReceivedMaterialList(response?.data?.data);
        setTotalPages(response?.data?.totalPages);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  return (
    <div className="row">
      {isLoading && <Loader />}
      <div className="row justify-content-end">
        <div className="col-lg-8">
          <RecordLimit />
        </div>
      </div>
      <div>
        {receivedMaterialList.length > 0 ? (
          receivedMaterialList.map((material, index) => (
            <div
              className="row mt-3 p-3"
              style={{
                backgroundColor: index % 2 === 0 ? "#F4F4F4" : "#ebe9e9",
              }}
              key={material._id}
            >
              <div className="col-lg-4">
                <p>
                  <strong>DI: </strong>
                  {material.di}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>GRN No.: </strong>
                  {material.grnNo}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Year: </strong>
                  {material.year}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Line No: </strong>
                  {material.Line_NO}
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
                  <strong>Total Quantity (Line No): </strong>
                  {material.totalQuantityLineNo}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Material Name: </strong>
                  {material.materialName}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Material Code: </strong>
                  {material.materialCode}
                </p>
              </div>

              <div className="col-lg-4">
                <p>
                  <strong>Material Group: </strong>
                  {material.Mat_Group}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Plant: </strong>
                  {material.plant}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Plant Name: </strong>
                  {material.plantName}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Store Location: </strong>
                  {material.storeLocation}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Tests: </strong>
                  {material.associatedTests.length > 0
                    ? material.associatedTests.map((test) => (
                        <div key={test}>{test}</div>
                      ))
                    : "NA"}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Labs: </strong>
                  {material.associatedLabs.length > 0
                    ? material.associatedLabs.map((lab) => (
                        <div key={lab}>{lab}</div>
                      ))
                    : "NA"}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Received Quantity: </strong>
                  {material.quantity}
                </p>
              </div>
              <div className="col-lg-4">
                <p>
                  <strong>Receive Date: </strong>
                  {dateFormat(material.receiveDate)}
                </p>
              </div>
              <div className="col-lg-12">
                <p>
                  <strong>Receive Material List: </strong>
                  <ListDownload data={material} />
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <p>No materials found</p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}

export default MaterialReceived;
