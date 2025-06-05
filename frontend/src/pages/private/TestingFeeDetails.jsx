import axios from "axios";
import React, { useEffect, useState } from "react";
import { apiUrl, dateFormat, setDateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import DIAutosuggestion from "../../component/DIAutosuggestion";

function TestingFeeDetails() {
  const [DIData, setDIData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewList, setViewList] = useState(false);
  const [sealingList, setSealingList] = useState([]);
  const [feeList, setFeeList] = useState([]);
  const [viewForm, setViewForm] = useState(false);
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    sealId: "",
    billDate: "",
    billAmount: "",
    billID: "",
    notes: "",
    paymentId: "",
  });

  const handleData = (data) => {
    setDIData(data);
    if (data === null) {
      setFormData({
        ...formData,
        billDate: "",
        billAmount: "",
        billID: "",
        notes: "",
        paymentId: "",
      });
      setViewList(false);
      setViewForm(false);
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
  const getFee = (sealId) => {
    setIsLoading(true);
    const data = {
      sealId: sealId,
      mode: "list",
    };
    axios
      .post(`${apiUrl}manage-Fees-Payment`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        setFeeList(response?.data?.data);
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
      paymentId: formData.paymentId,
      mode: formData.paymentId === "" ? "add" : "update",
      feesPayment: {
        billDate: formData.billDate,
        billAmount: formData.billAmount,
        billID: formData.billID,
        notes: formData.notes,
      },
    };
    axios
      .post(`${apiUrl}manage-Fees-Payment`, data, {
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
        getFee(formData.sealId);
        setFormData({
          ...formData,
          billDate: "",
          billAmount: "",
          billID: "",
          notes: "",
          paymentId: "",
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

  const deleteResult = (paymentId) => {
    setIsLoading(true);
    const data = {
      paymentId: paymentId,
      sealId: formData.sealId,
      mode: "delete",
    };
    axios
      .post(`${apiUrl}manage-Fees-Payment`, data, {
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
          getFee(formData.sealId);
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
  console.log("formData", formData);

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
                        <th>Item Inclosed</th>
                        <th>Team Member</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sealingList.length > 0 ? (
                        sealingList.map((seal) => (
                          <tr key={seal._id}>
                            <td>{seal.di}</td>
                            <td>
                              {seal.sealDetails}
                              {seal.canDispatch === 1 && (
                                <>
                                  {/* <br />
                                  <br />
                                  <span className="bg-dark p-1 text-white mt-2 rounded">
                                    Final Sample
                                  </span> */}
                                </>
                              )}
                            </td>
                            <td>{dateFormat(seal.sealingDate)}</td>
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
                                  setViewList(true);
                                  getFee(seal._id);
                                  setFormData({
                                    ...formData,
                                    sealId: seal._id,
                                  });
                                }}
                              >
                                Manage Fee
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
              Testing Fee{" "}
              <button
                className="btn btn-primary float-end"
                type="button"
                onClick={() => {
                  setViewForm(true);
                  setFormData({
                    ...formData,
                    billAmount: "",
                    billDate: "",
                    billID: "",
                    notes: "",
                    paymentId: "",
                  });
                }}
              >
                Add Fee
              </button>
            </h3>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Bill Amount</th>
                    <th>Bill Date</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feeList.length > 0 ? (
                    feeList.map((fee) => (
                      <tr key={fee._id}>
                        <td>{fee.billID}</td>
                        <td>{fee.billAmount}</td>
                        <td>{dateFormat(fee.billDate)}</td>
                        <td>{fee.notes}</td>
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
                                  deleteResult(fee._id);
                                }
                              });
                            }}
                          >
                            Delete
                          </button>
                          <button
                            className="btn btn-warning btn-sm ms-2"
                            type="button"
                            onClick={() => {
                              setViewForm(true);
                              setFormData({
                                ...formData,
                                billAmount: fee.billAmount,
                                billDate: setDateFormat(fee.billDate),
                                billID: fee.billID,
                                notes: fee.notes,
                                paymentId: fee._id,
                              });
                            }}
                          >
                            Edit
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

        {viewForm && (
          <div className="custom-modal-overlay">
            <div className="modal-dialog-centered p-4">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ justifyContent: "space-between" }}
                >
                  <h5 className="">
                    {formData.paymentId === "" ? `Add` : `Update`} Testing Fee
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
                      <label className="form-label">Bill ID</label>
                      <input
                        type="text"
                        name="billID"
                        className="form-control"
                        value={formData.billID}
                        onChange={handleChange}
                        placeholder="Bill ID"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Bill Date</label>
                      <input
                        type="date"
                        name="billDate"
                        className="form-control"
                        value={formData.billDate}
                        onChange={handleChange}
                        max={new Date().toISOString().split("T")[0]}
                        placeholder="Bill Date"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Bill Amount</label>
                      <input
                        type="text"
                        name="billAmount"
                        className="form-control"
                        value={formData.billAmount}
                        onChange={handleChange}
                        placeholder="Bill Amount"
                        required
                      />
                    </div>
                    <div className="col-md-4 mt-3">
                      <label className="form-label">Notes</label>
                      <input
                        type="text"
                        name="notes"
                        className="form-control"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Notes"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={isLoading}
                    >
                      {formData.paymentId === ""
                        ? `Submit Result`
                        : `Update Result`}
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

export default TestingFeeDetails;
