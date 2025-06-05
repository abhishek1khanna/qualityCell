import axios from "axios";
import React, { useEffect, useState } from "react";
import { apiUrl } from "../../constant/constant";
import Swal from "sweetalert2";
import { useUserContext } from "../../utils/userContext";
import RecordLimit from "../../component/RecordLimit";
import Pagination from "../../component/Pagination";

function TestCategory() {
  const { limit } = useUserContext();
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testOptions, setTestOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState({
    categoryName: "",
    categoryDescription: "",
    categoryId: "",
  });

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (token) {
      setToken(token);
      fetchTestCategory(token);
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
        deleteTest(id);
      }
    });
  }
  function fetchTestCategory(token) {
    setIsLoading(true);
    const data = {
      action: "list",
      page: currentPage,
      limit: limit,
    };
    axios
      .post(`${apiUrl}manageCategory`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        setTestOptions(response?.data?.data);
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
  const deleteTest = (id) => {
    const data = {
      action: "delete",
      catId: id,
    };
    setIsLoading(true);
    axios
      .post(`${apiUrl}manageCategory`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        fetchTestCategory(token);
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

  const updateTestCategory = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      action: formData.categoryId !== "" ? "edit" : "add",
      catId: formData.categoryId,
      categoryName: formData.categoryName,
      categoryDescription: formData.categoryDescription,
    };

    axios
      .post(`${apiUrl}manageCategory`, data, {
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
          categoryName: "",
          categoryDescription: "",
          categoryId: "",
        });
        fetchTestCategory(token);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
        Swal.fire("Error", "Failed to update test", "error");
      });
  };

  const addTestCategory = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      action: "add",
      categoryName: formData.categoryName,
      categoryDescription: formData.categoryDescription,
    };

    axios
      .post(`${apiUrl}manageCategory`, data, {
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
          categoryName: "",
          categoryDescription: "",
          categoryId: "",
        });
        fetchTestCategory(token);
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
            Add Test Category
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
              <th>Test Category</th>
              <th>Category Description</th>
              <th style={{ width: "125px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testOptions.map((item, index) => (
              <tr key={item._id}>
                {/* <td>{index + 1}</td> */}
                <td>{item.categoryName}</td>
                <td>{item.categoryDescription}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        categoryName: item.categoryName,
                        categoryDescription: item.categoryDescription,
                        categoryId: item._id,
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
                    {formData.categoryId === "" ? "Add" : "Update"} Test
                    Category
                    <button
                      type="button"
                      className="btn-close float-end"
                      onClick={() => setOpen(false)}
                    ></button>
                  </h5>
                </div>
                <div className="modal-body">
                  <form
                    onSubmit={
                      formData.categoryId === ""
                        ? addTestCategory
                        : updateTestCategory
                    }
                  >
                    <div className="row mb-3">
                      <div className="col-md-12 mt-3">
                        <label>Test Category Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.categoryName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              categoryName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-12 mt-3">
                        <label>Test Category Description</label>
                        <textarea
                          className="form-control"
                          value={formData.categoryDescription}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              categoryDescription: e.target.value,
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
                      {formData.categoryId === "" ? "Save" : "Update"} Changes
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

export default TestCategory;
