import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Multiselect from "multiselect-react-dropdown";
import Loader from "../../component/Loader";
import { apiUrl } from "../../constant/constant";
import Pagination from "../../component/Pagination";
import { useUserContext } from "../../utils/userContext";
import RecordLimit from "../../component/RecordLimit";

function NotificationList() {
  const { limit } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredData, setFilteredData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchNotification(storedToken);
    }
  }, [currentPage, limit]);
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);

  const fetchNotification = (token) => {
    setIsLoading(true);
    const data = {
      page: currentPage,
      limit: limit,
    };
    axios
      .post(`${apiUrl}list-notification`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log(response.data);
        setTotalPages(response.data.data.totalPages);
        setNotification(response.data.data.docs);
        setFilteredData(response.data.data.docs);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteNotification = (id) => {
    const data = {
      id: id,
    };
    axios
      .delete(`${apiUrl}delete-notification`, {
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
          title: response?.data?.message,
        });
        fetchNotification(token);
      })
      .catch((error) => {
        setIsLoading(false);
        setDIData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  useEffect(() => {
    if (searchTerm) {
      const filteredData = notification.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filteredData);
    } else {
      setFilteredData(notification);
    }
  }, [searchTerm]);
  return (
    <>
      {isLoading && <Loader />}
      {filteredData && (
        <div className="row">
          <div className="col-lg-4 mb-3">
            <input
              className="form-control"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              type="text"
              placeholder="Search"
            />
          </div>
          <div className="col-lg-8 my-3">
            <RecordLimit />
          </div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th style={{ width: "100px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((note) => (
                  <tr key={note._id}>
                    <td>{note.title}</td>
                    <td>{note.description}</td>
                    <td>
                      {/* <button className="btn btn-primary btn-sm">View</button> */}
                      <button
                        className="btn btn-danger btn-sm ms-2"
                        onClick={() => {
                          Swal.fire({
                            title: "Are you sure?",
                            text: "You want to delete this notification?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes",
                            cancelButtonText: "No",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              deleteNotification(note._id);
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
                  <td colSpan="4" align="center">
                    No data found
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
      )}
    </>
  );
}

export default NotificationList;
