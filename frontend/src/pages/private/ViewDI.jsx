import axios from "axios";
import React, { useEffect, useState } from "react";
import { apiUrl, dateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import Multiselect from "multiselect-react-dropdown";
import Loader from "../../component/Loader";
import Pagination from "../../component/Pagination";
import { useUserContext } from "../../utils/userContext";
import RecordLimit from "../../component/RecordLimit";

function ViewDI() {
  const { limit } = useUserContext();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [testOptions, setTestOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (token) {
      setToken(token);
      fetchMaterial(token);
      fetchTest(token);
    }
  }, [currentPage, limit]);
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);

  function fetchMaterial(token) {
    setIsLoading(true);
    const data = { page: currentPage, limit: limit };
    axios
      .post(`${apiUrl}list-material`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        setMaterialOptions(response?.data?.data);
        setTotalPages(response?.data?.totalPages);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }

  function handleDelete(id) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this material?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMaterial(id);
      }
    });
  }

  function fetchTest(token) {
    setIsLoading(true);
    const data = {
      action: "list",
    };
    axios
      .post(`${apiUrl}manageTests`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        setTestOptions(response?.data?.data);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }

  const deleteMaterial = (id) => {
    const data = {
      materialId: id,
    };
    setIsLoading(true);
    axios
      .delete(`${apiUrl}delete-material`, {
        data,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        Swal.fire("Success", "Material deleted successfully", "success");
        fetchMaterial(token);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };

  const handleEdit = (material) => {
    setSelectedMaterial(material);
  };

  const updateMaterial = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      materialId: selectedMaterial._id,
      materialName: selectedMaterial.materialName,
      quantity: selectedMaterial.quantity,
      purchaseOrderNo: selectedMaterial.purchaseOrderNo,
      firmName: selectedMaterial.firmName,
      labName: selectedMaterial.labName,
      tests: selectedMaterial.tests.map((item) => item._id),
    };

    axios
      .put(`${apiUrl}update-material`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        Swal.fire("Success", "Material updated successfully", "success");
        setSelectedMaterial(null);
        fetchMaterial(token);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
        Swal.fire("Error", "Failed to update material", "error");
      });
  };
  console.log("limit: ", limit);
  return (
    <>
      {isLoading && <Loader />}
      <div className="row justify-content-end">
        <div className="col-lg-8">
          <RecordLimit />
        </div>
      </div>

      {materialOptions.length > 0 ? (
        materialOptions.map((material, index) => (
          <div
            className="row mt-3 p-3"
            style={{
              backgroundColor: index % 2 === 0 ? "#F4F4F4F4" : "#ebe9e9",
            }}
            key={index}
          >
            <div className="col-lg-4">
              <p>
                <strong>DI: </strong>
                {material.di}
              </p>
            </div>
            <div className="col-lg-4">
              <p>
                <strong>Name of the Firm: </strong>
                {material.Name_of_the_Firm}
              </p>
            </div>
            <div className="col-lg-4">
              <p>
                <strong>Supplier Address: </strong>
                {material.Supplier_Address}
              </p>
            </div>
            <div className="col-lg-4">
              <p>
                <strong>Supplier email: </strong>
                {material.Supplier_email}
              </p>
            </div>
            <div className="col-lg-4">
              <p>
                <strong>Supplier Mobile No: </strong>
                {material.Supplier_Mobile_No}
              </p>
            </div>

            <div className="col-lg-4">
              <p>
                <strong>PO No:</strong>
                {material.PONo}
              </p>
            </div>
            <div className="col-lg-4">
              <p>
                <strong>PO Quantity:</strong>
                {material.POQuantity}
              </p>
            </div>
            <div className="col-lg-4">
              <p>
                <strong>Bank Guarantee Amount:</strong>
                {material.bankGuaranteeAmount}
              </p>
            </div>
            <div className="col-lg-4">
              <p>
                <strong>BG Expiry Date:</strong>
                {material.BGExpiryDate && dateFormat(material.BGExpiryDate)}
              </p>
            </div>
            <div className="col-lg-4">
              <p>
                <strong>Material Tag:</strong>
                {material.materialTag}
              </p>
            </div>
            <table className="table table-bordered table-transparent">
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Mat Group</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Line No</th>
                  <th>Contract No</th>
                  <th>Plant Name</th>
                  <th>Store Location</th>
                  <th>Tests</th>
                  <th>Labs</th>
                </tr>
              </thead>
              <tbody>
                {material.Data.map((data) => (
                  <tr key={data.Material_Code}>
                    <td>{data.Material_Name}</td>
                    <td>{data.Mat_Group}</td>
                    <td>{data.Quantity}</td>
                    <td>{data.Price}</td>
                    <td>{data.Line_NO}</td>
                    <td>{data.Contract_No}</td>
                    <td>
                      {data.Plant_Name}({data.Plant})
                    </td>
                    <td>{data.Store_Location}</td>
                    <td>
                      {data.tests.map((test) => (
                        <div key={test}>{test}</div>
                      ))}
                    </td>
                    <td>
                      {data.labs.map((lab) => (
                        <div key={lab}>{lab}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="col-lg-12 p-0">
              <button
                className="btn btn-danger btn-sm float-end"
                onClick={() => handleDelete(material._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-5">
          <h3>No DI found</h3>
        </div>
      )}
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
      {selectedMaterial && (
        <div className="custom-modal-overlay">
          <div className="modal-dialog-centered p-4">
            <div className="modal-content">
              <div className="modal-header" style={{ display: "block" }}>
                <h5 className="modal-title">
                  Edit Material{" "}
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={() => setSelectedMaterial(null)}
                  ></button>
                </h5>
              </div>
              <div className="modal-body pb-5">
                <form onSubmit={updateMaterial}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Material Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedMaterial.materialName}
                        onChange={(e) =>
                          setSelectedMaterial({
                            ...selectedMaterial,
                            materialName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={selectedMaterial.quantity}
                        onChange={(e) =>
                          setSelectedMaterial({
                            ...selectedMaterial,
                            quantity: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Order No</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedMaterial.purchaseOrderNo}
                        onChange={(e) =>
                          setSelectedMaterial({
                            ...selectedMaterial,
                            purchaseOrderNo: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label>Firm</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedMaterial.firmName}
                        onChange={(e) =>
                          setSelectedMaterial({
                            ...selectedMaterial,
                            firmName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Lab</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedMaterial.labName}
                        onChange={(e) =>
                          setSelectedMaterial({
                            ...selectedMaterial,
                            labName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-5">
                      <label>Tests</label>
                      <Multiselect
                        options={testOptions} // Options to display in the dropdown
                        selectedValues={selectedMaterial.tests} // Preselected values in the dropdown
                        onSelect={(selectedList, selectedItem) =>
                          setSelectedMaterial({
                            ...selectedMaterial,
                            tests: selectedList, // Update the `tests` with the selected options
                          })
                        }
                        onRemove={(selectedList, removedItem) =>
                          setSelectedMaterial({
                            ...selectedMaterial,
                            tests: selectedList, // Update the `tests` when an item is removed
                          })
                        }
                        displayValue="testName" // Property name to display in the dropdown options
                        placeholder="Select Tests"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewDI;
