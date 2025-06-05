import axios from "axios";
import React, { useEffect, useState } from "react";
import { apiUrl, dateFormat, setDateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import DIAutosuggestion from "../../component/DIAutosuggestion";
import Multiselect from "multiselect-react-dropdown";
import { useUserContext } from "../../utils/userContext";
import Pagination from "../../component/Pagination";
import RecordLimit from "../../component/RecordLimit";

function ReceiptBackDetails() {
  const { limit } = useUserContext();
  const [DIData, setDIData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewList, setViewList] = useState(false);
  const [sealingList, setSealingList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [receiveList, setReceiveList] = useState([]);
  const [viewForm, setViewForm] = useState(false);
  const [token, setToken] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState({
    sealId: "",
    itemReceiveId: "",
    itemList: [],
    dateOfTransaction: "",
    details: "",
    checkedItemsArray: [],
    receivedDate: "",
  });

  const handleData = (data) => {
    setDIData(data);
    if (data === null) {
      setViewList(false);
      setSealingList([]);
      setItemList([]);
      setReceiveList([]);
      setViewForm(false);
      setFormData({
        ...formData,
        itemReceiveId: "",
        itemList: [],
        dateOfTransaction: "",
        details: "",
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
        console.log("Response:", response?.data?.data[0]?.itemsSent || []);
        setViewList(false);
        setSealingList(response?.data?.data);
        /* setFormData({
          ...formData,
          sealId: response?.data?.data[0]?._id,
        }); */
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  useEffect(() => {
    if (formData.sealId !== "") {
      getReceive(formData.sealId);
    }
  }, [formData.sealId, limit, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);

  const getReceive = (sealId) => {
    setIsLoading(true);
    const data = {
      sealId: sealId,
      mode: "list",
      page: currentPage,
      limit: limit,
    };
    axios
      .post(`${apiUrl}manage-Item-Receive`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        setReceiveList(response?.data?.data);
        setTotalPages(response?.data?.totalPages);
        setViewList(true);
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
    if (formData.checkedItemsArray.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Please select items to receive",
      });
      return;
    }
    if (formData.receivedDate === "") {
      Swal.fire({
        icon: "error",
        title: "Please select received date",
      });
      return;
    }
    setIsLoading(true);
    const data = {
      sealId: formData.sealId,
      itemReceiveId: formData.itemReceiveId,
      mode: formData.itemReceiveId === "" ? "add" : "update",
      checkedItemsArray: formData.checkedItemsArray,
      receiveDate: formData.receivedDate,
    };
    axios
      .post(`${apiUrl}manage-Item-Receive`, data, {
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
        getReceive(formData.sealId);
        setFormData({
          ...formData,
          itemReceiveId: "",
          itemList: [],
          dateOfTransaction: "",
          details: "",
          labName: "",
          checkedItemsArray: [],
        });
      })
      .catch((error) => {
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
      itemReceiveId: id,
      sealId: formData.sealId,
      mode: "delete",
    };
    axios
      .post(`${apiUrl}manage-Item-Receive`, data, {
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
          getReceive(formData.sealId);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Updates the itemList with the selected values
    }));
  };
  console.log("formData", formData);

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <DIAutosuggestion sampleData={handleData} />
        {DIData && (
          <>
            {sealingList.length > 0 && (
              <>
                <h3 className="mb-2 mt-3">Dispatch List</h3>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Labs</th>
                        <th>Test</th>
                        <th>Line</th>
                        <th>Material Name</th>
                        <th>Item ID</th>
                        <td>Location---</td>
                        <th style={{ width: "120px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sealingList.length > 0 ? (
                        sealingList.map(
                          (item) =>
                            item.itemsSent.length > 0 &&
                            item.itemsSent.map((sent) => (
                              <tr
                                className={
                                  formData.checkedItemsArray.includes(
                                    sent._id
                                  ) && "selectedCell"
                                }
                                key={sent._id}
                              >
                                <td>
                                  {sent.inLabs.map((lab, index) => (
                                    <div key={lab + "-" + index}>{lab}</div>
                                  ))}
                                </td>
                                <td>
                                  {sent.testToPerform.map((test, index) => (
                                    <div key={test + "-" + index}>{test}</div>
                                  ))}
                                </td>
                                <td>{sent.Line_NO}</td>
                                <td>{sent.materialName}</td>
                                <td>{sent.itemID}</td>
                                <td>{sent.location}</td>
                                <td>
                                  <button
                                    className={`btn btn-sm ${
                                      formData.checkedItemsArray.includes(
                                        sent._id
                                      )
                                        ? "btn-danger"
                                        : "btn-primary"
                                    }`}
                                    type="button"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        checkedItemsArray:
                                          formData.checkedItemsArray.includes(
                                            sent._id
                                          )
                                            ? formData.checkedItemsArray.filter(
                                                (id) => id !== sent._id
                                              )
                                            : [
                                                ...formData.checkedItemsArray,
                                                sent._id,
                                              ],
                                        sealId: item._id,
                                      });
                                    }}
                                  >
                                    {formData.checkedItemsArray.includes(
                                      sent._id
                                    )
                                      ? "Remove"
                                      : "Select"}
                                  </button>
                                </td>
                              </tr>
                            ))
                        )
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="row mb-5">
                    <div className="col-md-3">
                      <label className="form-label">Received Date</label>
                      <input
                        type="date"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            receivedDate: e.target.value,
                          }))
                        }
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-9 text-end">
                      <button className="btn btn-success " type="submit">
                        Received
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        {viewList && (
          <>
            <h3 className="mb-2">Received Items </h3>
            {/* <div className="row justify-content-end">
              <div className="col-lg-8">
                <RecordLimit />
              </div>
            </div> */}
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Labs</th>
                    <th>Test</th>
                    <th>Line</th>
                    <th>Material Name</th>
                    <th>Received Date</th>
                    <th>Item ID</th>
                    <td>Location</td>
                    <th style={{ width: "120px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receiveList.length > 0 ? (
                    receiveList.map((receive) => (
                      <tr key={receive._id}>
                        <td>
                          {receive.inLabs.map((lab, index) => (
                            <div key={lab + "-" + index}>{lab}</div>
                          ))}
                        </td>
                        <td>
                          {receive.testToPerform.map((test, index) => (
                            <div key={test + "-" + index}>{test}</div>
                          ))}
                        </td>
                        <td>{receive.Line_NO}</td>
                        <td>{receive.materialName}</td>
                        <td>{dateFormat(receive.dateOfTransaction)}</td>
                        <td>{receive.itemID}</td>
                        <td>{receive.location}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => {
                              Swal.fire({
                                title: "Are you sure?",
                                text: "You want to delete this receive?",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "Yes, delete it!",
                              }).then((confirm) => {
                                if (confirm.isConfirmed) {
                                  deleteResult(receive._id);
                                }
                              });
                            }}
                          >
                            Delete
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
            <div className="modal-dialog-centered p-4">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ justifyContent: "space-between" }}
                >
                  <h5 className="">
                    {formData.itemReceiveId === "" ? `Add` : `Update`} Receipt
                  </h5>
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={() => setViewForm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Items</label>
                      <Multiselect
                        options={itemList.map((item) => ({
                          grnNo: item.grnNo,
                          itemID: item.itemID,
                        }))} // Map items for the dropdown
                        selectedValues={formData.itemList} // Pre-select items from formData
                        onSelect={(selectedList) => {
                          handleMultiSelectChange({
                            target: {
                              name: "itemList",
                              value: selectedList,
                            },
                          });
                        }}
                        onRemove={(selectedList) => {
                          handleMultiSelectChange({
                            target: {
                              name: "itemList",
                              value: selectedList,
                            },
                          });
                        }}
                        displayValue="itemID" // Display itemID in the dropdown
                        placeholder="Select Item"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Transaction Date</label>
                      <input
                        type="date"
                        name="dateOfTransaction"
                        className="form-control"
                        value={formData.dateOfTransaction}
                        onChange={handleChange}
                        max={new Date().toISOString().split("T")[0]}
                        placeholder="Transaction Date"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Receive Details</label>
                      <input
                        type="text"
                        name="details"
                        className="form-control"
                        value={formData.details}
                        onChange={handleChange}
                        placeholder="Receive details"
                        required
                      />
                    </div>
                    <div className="col-md-5 mt-3">
                      <label className="form-label">Lab Name</label>
                      <input
                        type="text"
                        name="labName"
                        className="form-control"
                        value={formData.labName}
                        onChange={handleChange}
                        placeholder="Lab Name"
                        required
                        disabled
                      />
                      {console.log("itemList", formData)}
                      {/* <select
                        className="form-control"
                        value={formData.labName}
                        name="labName"
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Select Lab
                        </option>
                        {itemList[0].inLabs.map((lab) => (
                          <option key={lab} value={lab}>
                            {lab}
                          </option>
                        ))}
                      </select> */}
                    </div>
                  </div>
                  <div className="col-md-12">
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={isLoading}
                    >
                      {formData.itemReceiveId === ""
                        ? `Submit Receipt`
                        : `Update Receipt`}
                    </button>
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

export default ReceiptBackDetails;
