import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl, dateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import ListDownload from "../../component/ListDownload";
import Pagination from "../../component/Pagination";
import Loader from "../../component/Loader";
import { useUserContext } from "../../utils/userContext";
import RecordLimit from "../../component/RecordLimit";

function ViewReceiptOfMaterials() {
  const { limit } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [MaterialData, setMaterialData] = useState(null);
  const [selectedGrn, setSelectedGrn] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleEdit = (grn) => {
    setSelectedGrn(grn);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
      getSample(token);
    }
    if (isDeleted) {
      getSample(token);
    }
  }, [isDeleted, currentPage, limit]);
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);

  function getSample(token) {
    setIsLoading(true);
    const data = {
      materialID: searchTerm,
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
        setMaterialData(response?.data?.data);
        setTotalPages(response?.data?.totalPages);
      })
      .catch((error) => {
        setIsLoading(false);
        setMaterialData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }

  const deleteMaterial = (id) => {
    setIsDeleted(false);
    const data = {
      grnId: id,
    };
    setIsLoading(true);
    axios
      .delete(`${apiUrl}delete-grn`, {
        data,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response?.data?.message,
        });
        setIsDeleted(true);
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
    <>
      {isLoading && <Loader />}
      <div className="row justify-content-end">
        <div className="col-lg-8">
          <RecordLimit />
        </div>
      </div>
      {MaterialData && (
        <div>
          {MaterialData.length > 0 ? (
            MaterialData.map((material, index) => (
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
                          <span key={test}>{test}</span>
                        ))
                      : "NA"}
                  </p>
                </div>
                <div className="col-lg-4">
                  <p>
                    <strong>Labs: </strong>
                    {material.associatedLabs.length > 0
                      ? material.associatedLabs.map((lab) => (
                          <span key={lab}>{lab}</span>
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
                <div className="col-lg-12 p-0">
                  <button
                    className="btn btn-danger btn-sm float-end"
                    onClick={() => {
                      Swal.fire({
                        title: "Are you sure?",
                        text: "You want to delete this material?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Yes",
                      }).then((result) => {
                        if (result.isConfirmed) {
                          deleteMaterial(material._id);
                        }
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">
              <p>No materials found</p>
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      )}
    </>
  );
}

export default ViewReceiptOfMaterials;
