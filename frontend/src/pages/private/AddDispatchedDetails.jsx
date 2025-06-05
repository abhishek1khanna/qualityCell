import axios from "axios";
import React, { useEffect, useState } from "react";
import { apiUrl, dateFormat, setDateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import DIAutosuggestion from "../../component/DIAutosuggestion";
import { useUserContext } from "../../utils/userContext";
import Pagination from "../../component/Pagination";

function AddDispatchedDetails() {
  const { limit } = useUserContext();
  const [DIData, setDIData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewList, setViewList] = useState(false);
  const [sealingList, setSealingList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [dispatchList, setDispatchList] = useState([]);
  const [viewForm, setViewForm] = useState(false);
  const [token, setToken] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [associatedTags, setAssociatedTag] = useState("");
  const [formData, setFormData] = useState({
    sealId: "",
    itemSentId: "",
    itemList: [],
    dateOfTransaction: "",
    details: "",
    labName: "",
    checkedItemsArray: [],
    dispatchedDate: "",
    vehicleNo: "",
  });

  const handleData = (data) => {
    setDIData(data);
    if (data === null) {
      setViewList(false);
      setSealingList([]);
      setItemList([]);
      setDispatchList([]);
      setViewForm(false);
      setFormData({
        ...formData,
        itemSentId: "",
        itemList: [],
        dateOfTransaction: "",
        details: "",
        labName: "",
      });
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && DIData) {
      setToken(token);
      getSealingList(token);
    }
  }, [DIData]);
  const getSealingList = (token) => {
    setIsLoading(true);
    const data = {
      di: DIData.di,
    };
    axios
      .post(`${apiUrl}list-seal`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        setViewList(false);
        setSealingList(response?.data?.data);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  console.log("sealingList", sealingList);
  useEffect(() => {
    if (formData.sealId !== "") {
      getDispatch(formData.sealId);
    }
  }, [limit, currentPage]);
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);
  const getDispatch = (sealId) => {
    setIsLoading(true);
    const data = {
      sealId: sealId,
      mode: "list",
      page: currentPage,
      limit: limit,
    };
    axios
      .post(`${apiUrl}manage-Item-Send`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data.data);
        setDispatchList(response?.data?.data);
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
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      sealId: formData.sealId,
      itemSentId: formData.itemSentId,
      mode: formData.itemSentId === "" ? "add" : "update",
      checkedItemsArray: formData.checkedItemsArray,
      sendDate: formData.dispatchedDate,
      VehicleNo: formData.vehicleNo,
    };
    axios
      .post(`${apiUrl}manage-Item-Send`, data, {
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
          title: response?.data?.message,
        });
        setViewForm(false);
        getDispatch(formData.sealId);
        setFormData({
          ...formData,
          itemSentId: "",
          itemList: [],
          dateOfTransaction: "",
          details: "",
          labName: "",
          checkedItemsArray: [],
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Opps!",
          text: error?.response?.data?.message || "Failed to add dispatch.",
        });
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };

  const deleteResult = (id) => {
    setIsLoading(true);
    const data = {
      itemSentId: id,
      sealId: formData.sealId,
      mode: "delete",
    };
    axios
      .post(`${apiUrl}manage-Item-Send`, data, {
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
          title: response?.data?.message || "Result deleted successfully!",
        });

        // Refresh the result list after successful deletion
        if (formData.sealId) {
          getDispatch(formData.sealId);
        }
      })
      .catch((error) => {
        setIsLoading(false);

        if (error?.response?.data?.message === "error in token") {
          console.log("Invalid or expired token. Please reauthenticate.");
          Swal.fire({
            icon: "error",
            title: "Session Expired",
            text: "Your session token is invalid. Please log in again.",
          });
        } else {
          console.error("Error:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text:
              error?.response?.data?.message || "Failed to delete the result.",
          });
        }
      });
  };

  const diffDate = (date) => {
    const currentDate = new Date();
    const sealingDate = new Date(date);
    const diffTime = Math.abs(sealingDate - currentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const formatSealDetails = (isoDate) => {
    const date = new Date(isoDate);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getUTCFullYear();

    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };
  const itemCheck = (seal) => {
    const data = {
      di: DIData?.di,
    };
    axios
      .post(`${apiUrl}manage-Item-Send-check`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);

        /* Swal.fire({
          icon: "success",
          title: response?.data?.message,
        }); */
        setViewList(true);
        getDispatch(seal._id);
        setItemList(seal.samplesSelected);
        setFormData({
          ...formData,
          sealId: seal._id,
        });
      })
      .catch((error) => {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error?.response?.data?.message || "Failed to delete the result.",
        });
      });
  };
  console.log("____", DIData?.materialTag);
  const isTransformer = DIData?.materialTag
    ?.toLowerCase()
    ?.includes("transformer");
  console.log(isTransformer);
  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <DIAutosuggestion sampleData={handleData} />
        {DIData && (
          <>
            {sealingList.length > 0 && (
              <>
                <h3 className="mb-2 mt-3">Sealings List</h3>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>DI</th>
                        <th>Seal Details</th>
                        <th>Sealing Date</th>
                        <th>No. of days from sealing date</th>
                        <th>Item Inclosed</th>
                        <th>Team Member</th>
                        <th style={{ width: "144px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sealingList.length > 0 ? (
                        sealingList.map((seal) => (
                          <tr key={seal._id}>
                            <td>{seal.di}</td>
                            <td>{seal.sealDetails}</td>
                            <td>{formatSealDetails(seal.sealingDate)}</td>
                            <td>{diffDate(seal.sealingDate)} Days</td>
                            <td>
                              {seal.samplesSelected.map((sample, index) => (
                                <div key={sample._id}>
                                  {index + 1}. {sample.itemID} ({sample.grnNo})
                                </div>
                              ))}
                            </td>
                            <td>
                              {seal.teamMembersSelected.map((member, index) => (
                                <div key={member._id}>
                                  {index + 1}. {member.memberName} (
                                  {member.role})
                                </div>
                              ))}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-warning btn-sm"
                                onClick={() => {
                                  if (isTransformer) {
                                    itemCheck(seal);
                                  } else {
                                    setViewList(true);
                                    getDispatch(seal._id);
                                    setItemList(seal.samplesSelected);
                                    setAssociatedTag(seal.associatedTags);
                                    setFormData({
                                      ...formData,
                                      sealId: seal._id,
                                    });
                                  }
                                }}
                              >
                                Manage Dispatch
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
        {viewList && (
          <>
            <h3 className="mb-2">
              Dispatches{" "}
              <button
                className="btn btn-primary float-end"
                type="button"
                onClick={() => {
                  setViewForm(true);
                  setFormData({
                    ...formData,
                    itemSentId: "",
                    itemList: [],
                    dateOfTransaction: "",
                    details: "",
                    labName: "",
                  });
                }}
              >
                Add Dispatch
              </button>
            </h3>
            {/* <div className="row justify-content-end">
              <div className="col-lg-8">
                <RecordLimit />
              </div>
            </div> */}
            {console.log("dispatchList", dispatchList)}
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Labs</th>
                    <th>Test</th>
                    <th>Line</th>
                    <th>Material Name</th>
                    <th>Dispatched Date</th>
                    <th>Vehicle No.</th>
                    <th>Item ID</th>
                    <td>Location</td>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchList.length > 0 ? (
                    dispatchList.map((disapatch) => (
                      <tr key={disapatch._id}>
                        <td>
                          {disapatch.inLabs.map((lab, index) => (
                            <div key={lab + "-" + index}>{lab}</div>
                          ))}
                        </td>
                        <td>
                          {disapatch.testToPerform.map((test, index) => (
                            <div key={test + "-" + index}>{test}</div>
                          ))}
                        </td>
                        <td>{disapatch.Line_NO}</td>
                        <td>{disapatch.materialName}</td>
                        <td>{dateFormat(disapatch.dateOfTransaction)}</td>
                        <td>{disapatch.VehicleNo}</td>
                        <td>{disapatch.itemID}</td>
                        <td>{disapatch.location}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => {
                              Swal.fire({
                                title: "Are you sure?",
                                text: "You want to delete this fee?",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "Yes, delete it!",
                              }).then((confirm) => {
                                if (confirm.isConfirmed) {
                                  deleteResult(disapatch._id);
                                }
                              });
                            }}
                          >
                            Delete
                          </button>
                          {/* <button
                            className="btn btn-warning btn-sm ms-2"
                            type="button"
                            onClick={() => {
                              setViewForm(true);
                              setFormData({
                                ...formData,
                                itemSentId: fee._id,
                                itemList: fee.itemList.map(
                                  ({ _id, ...rest }) => rest
                                ),
                                dateOfTransaction: setDateFormat(
                                  fee.dateOfTransaction
                                ),
                                details: fee.details,
                                labName: fee.labName,
                              });
                            }}
                          >
                            Edit
                          </button> */}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </div>
          </>
        )}

        {viewForm && (
          <div className="custom-modal-overlay">
            <div
              className="modal-dialog-centered p-4"
              style={{ maxWidth: "none" }}
            >
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ justifyContent: "space-between" }}
                >
                  <h5 className="">
                    {formData.itemSentId === "" ? `Add` : `Update`} Dispatch
                  </h5>
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={() => setViewForm(false)}
                  ></button>
                </div>
                <div
                  className="modal-body p-3"
                  style={{
                    maxHeight: "calc(100vh - 200px)",
                    overflowY: "auto",
                  }}
                >
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <label className="form-label">Items</label>
                      {console.log("itemList: ", itemList)}
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>Labs</th>
                            <th>Test</th>
                            <th>Line</th>
                            <th>Material Name</th>
                            <th>Item ID</th>
                            <th>Location</th>
                            <th style={{ width: "110px" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemList
                            .filter((item) => item.finalSample === 1) // Only render items with finalSample === 1
                            .map((item) => {
                              const isSelected =
                                formData.checkedItemsArray.includes(item._id);
                              return (
                                <React.Fragment key={item._id}>
                                  <tr
                                    className={isSelected ? "selectedCell" : ""}
                                  >
                                    <td>
                                      {item.inLabs.map((lab, index) => (
                                        <div key={lab + "-" + index}>{lab}</div>
                                      ))}
                                    </td>
                                    <td>
                                      {item.testToPerform.map((test, index) => (
                                        <div key={test + "-" + index}>
                                          {test}
                                        </div>
                                      ))}
                                    </td>
                                    <td>{item.Line_NO}</td>
                                    <td>{item.materialName}</td>
                                    <td>{item.itemID}</td>
                                    <td>{item.location}</td>

                                    <td
                                      style={{ verticalAlign: "middle" }}
                                      rowSpan={item.testName ? 2 : 1}
                                    >
                                      <button
                                        className={`btn btn-sm ${
                                          isSelected
                                            ? "btn-danger"
                                            : "btn-primary"
                                        }`}
                                        type="button"
                                        onClick={() => {
                                          setFormData({
                                            ...formData,
                                            checkedItemsArray: isSelected
                                              ? formData.checkedItemsArray.filter(
                                                  (id) => id !== item._id
                                                )
                                              : [
                                                  ...formData.checkedItemsArray,
                                                  item._id,
                                                ],
                                          });
                                        }}
                                      >
                                        {isSelected ? "Remove" : "Select"}
                                      </button>
                                    </td>
                                  </tr>

                                  {item.testName && (
                                    <tr
                                      className={
                                        isSelected ? "selectedCell" : ""
                                      }
                                    >
                                      <td colSpan={6}>
                                        <strong>Additional Test Name:</strong>{" "}
                                        {item.testName}
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                    {itemList.some((item) => item.finalSample === 1) && (
                      <div className="row mb-5">
                        <div className="col-md-3">
                          <label className="form-label">Dispatch Date</label>
                          <input
                            type="date"
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                dispatchedDate: e.target.value,
                              }))
                            }
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Vehicle No.</label>
                          <input
                            type="text"
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                vehicleNo: e.target.value,
                              }))
                            }
                            className="form-control"
                          />
                        </div>
                        <div className="col-md-6 text-end">
                          <label className="form-label d-block">&nbsp;</label>
                          <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={isLoading}
                          >
                            {formData.itemSentId === ""
                              ? "Submit Dispatch"
                              : "Update Dispatch"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

export default AddDispatchedDetails;
