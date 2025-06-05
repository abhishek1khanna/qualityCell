import axios from "axios";
import React, { useEffect, useState } from "react";
import { apiUrl } from "../../constant/constant";
import Swal from "sweetalert2";
import Pagination from "../../component/Pagination";
import { useUserContext } from "../../utils/userContext";
import RecordLimit from "../../component/RecordLimit";

function Labs() {
  const { limit } = useUserContext();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [labOptions, setLabOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState({
    labName: "",
    labLocation: "",
    labId: "",
  });

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (token) {
      setToken(token);
      fetchLabs(token);
    }
  }, [currentPage, limit]);
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);
  function handleDelete(id) {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this test?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteLab(id);
      }
    });
  }
  function fetchLabs(token) {
    setIsLoading(true);
    const data = {
      action: "list",
      page: currentPage,
      limit: limit,
    };
    axios
      .post(`${apiUrl}manageLabs`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        setLabOptions(response?.data?.data);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }
  const deleteLab = (id) => {
    const data = {
      action: "delete",
      labId: id,
    };
    setIsLoading(true);
    axios
      .post(`${apiUrl}manageLabs`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        fetchLabs(token);
        Swal.fire({
          icon: "success",
          title: "Test deleted successfully!",
        });
      })
      .catch((error) => {
        // Stop loading
        setIsLoading(false);

        // Extract and log the error message
        const errorMessage =
          error?.response?.data?.message || "Failed to delete the test.";
        console.error("Error:", error);

        // Show error notification
        Swal.fire({
          icon: "error",
          title: errorMessage,
        });

        // Handle token-specific errors if necessary
        if (error?.response?.data?.message === "error in token") {
          console.log("Token error detected. Logging out...");
          // Add token handling logic here, such as redirecting to login
        }
      });
  };

  const updateLab = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      action: formData.labId !== "" ? "edit" : "add",
      labId: formData.labId,
      labName: formData.labName,
      labLocation: formData.labLocation,
    };

    axios
      .post(`${apiUrl}manageLabs`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.data.message,
        });
        setOpen(false);
        setFormData({
          labName: "",
          labLocation: "",
          labId: "",
        });
        fetchLabs(token);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
        Swal.fire("Error", "Failed to update test", "error");
      });
  };

  const addLab = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      action: "add",
      labName: formData.labName,
      labLocation: formData.labLocation,
    };

    axios
      .post(`${apiUrl}manageLabs`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.data.message,
        });
        setOpen(false);
        setFormData({
          labName: "",
          labLocation: "",
          labId: "",
        });
        fetchLabs(token);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
        Swal.fire("Error", "Failed to update test", "error");
      });
  };

  return (
    <>
      <div className="row">
        <div className="col-lg-4 mb-3">
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            Add Lab
          </button>
        </div>
        <div className="col-lg-8">
          <RecordLimit />
        </div>
      </div>
      <div className="row table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              {/* <th>S.No.</th> */}
              <th>Lab Name</th>
              <th>Lab Location</th>
              <th style={{ width: "125px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {labOptions.map((item, index) => (
              <tr key={item._id}>
                {/* <td>{index + 1}</td> */}
                <td>{item.labName}</td>
                <td>{item.labLocation}</td>

                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        labName: item.labName,
                        labLocation: item.labLocation,
                        labId: item._id,
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
        {/* Edit Modal */}
        {open && (
          <div className="custom-modal-overlay">
            <div className="modal-dialog-centered p-4">
              <div className="modal-content">
                <div className="modal-header" style={{ display: "block" }}>
                  <h5 className="modal-title">
                    {formData.labId === "" ? "Add" : "Update"} Lab
                    <button
                      type="button"
                      className="btn-close float-end"
                      onClick={() => setOpen(false)}
                    ></button>
                  </h5>
                </div>
                <div className="modal-body">
                  <form onSubmit={formData.labId === "" ? addLab : updateLab}>
                    <div className="row mb-3">
                      <div className="col-md-12 mt-3">
                        <label>Lab Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.labName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              labName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-12 mt-3">
                        <label>Lab Location</label>
                        <textarea
                          className="form-control"
                          value={formData.labLocation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              labLocation: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {formData.labId === "" ? "Save" : "Update"} Changes
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Labs;
