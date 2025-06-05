import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { apiUrl, dateFormat, setDateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import DIAutosuggestion from "../../component/DIAutosuggestion";
import Multiselect from "multiselect-react-dropdown";
import Loader from "../../component/Loader";
import Pagination from "../../component/Pagination";
import { useUserContext } from "../../utils/userContext";
import RecordLimit from "../../component/RecordLimit";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { a } from "framer-motion/client";
import ProgressBar from "../../component/ProgressBar";

dayjs.extend(customParseFormat);

function SealingDetails() {
  const { limit } = useUserContext();
  const [DIData, setDIData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [sealingList, setSealingList] = useState([]);
  const [sampleList, setSampleList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [viewForm, setViewForm] = useState(false);
  const [actionType, setActionType] = useState("add");
  const [token, setToken] = useState("");
  const [sealingDate, setSealingDate] = useState("");
  const [isTeamCreated, setIsTeamCreated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    sealingDate: "",
    actualSealingDate: "",
    sealDetails: "",
    paymentTypes: "",
    samples: [],
    di: "",
    teamMembers: [],
    photographs: null,
    video: null,

    sealedImage: null,
    sealingVideo: null,
    sampleID: "",
  });

  const handleData = (data) => {
    setDIData(data);
    if (data === null) {
      setSealingList([]);
      setSampleList([]);
      setViewForm(false);
      setActionType("add");
      setFormData({
        id: "",
        sealingDate: "",
        actualSealingDate: "",
        sealDetails: "",
        paymentTypes: "",
        samples: [],
        di: "",
        teamMembers: [],
        photographs: null,
        video: null,

        sealedImage: null,
        sealingVideo: null,
      });
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && DIData) {
      setToken(token);
      //getTeam(token);
      getSealingList(token);
      getSample(token);
    }
  }, [DIData, limit, currentPage]);

  const getSealingList = (token) => {
    setIsLoading(true);
    const data = {
      di: DIData.di,
      page: currentPage,
      limit: limit,
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
        setSealingList(response?.data?.data);
        setTotalPages(response?.data?.totalPages);
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

  const getSample = (token, id = "") => {
    setIsLoading(true);
    const data = {
      di: DIData?.di,
      id: id,
    };
    axios
      .post(`${apiUrl}list-sample`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        setFormData((prevFormData) => ({
          ...prevFormData,
          di: DIData.di,
        }));
        console.log("Response:", response?.data);
        setSampleList(response?.data?.data);
        setFormData((prevFormData) => ({
          ...prevFormData,
          sealDetails: response?.data?.data[0]?.sealDetails,
          sealingDate: formatSealDetails(response?.data?.data[0]?.sealingDate),
          actualSealingDate: response?.data?.data[0]?.actualSealingDate,
          samples: response?.data?.data[0]?.items.map((item) => ({
            grnNo: item.grnNo,
            itemID: item.itemID,
          })),
        }));
        setSealingDate(response?.data?.data[0]?.sealingDate);
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

  function getTeam(token) {
    setIsLoading(true);
    const data = {
      di: DIData?.di,
    };
    axios
      .post(`${apiUrl}list-team`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        if (response?.data?.data.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "Please create team first",
          });
          setIsTeamCreated(false);
        } else {
          setIsTeamCreated(true);
        }
        setTeamList(response?.data?.data);
      })
      .catch((error) => {
        setIsLoading(false);
        setDIData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    getSample(token);

    // List of required fields
    const requiredFields = [
      { key: "sampleID", label: "Sample ID" },
      { key: "sealingDate", label: "Sealing Date" },
      { key: "paymentTypes", label: "Fee Type" },
      { key: "sealDetails", label: "Seal Details" },
      { key: "samples", label: "Samples" },
      { key: "di", label: "DI Number" },
      { key: "teamMembers", label: "Team Members" },
    ];

    // Check for missing fields
    const missingFields = requiredFields
      .filter(
        (field) =>
          !formData[field.key] ||
          (Array.isArray(formData[field.key]) &&
            formData[field.key].length === 0)
      )
      .map((field) => field.label);

    // Show alert if any required field is missing
    if (missingFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: `Please fill the following fields: ${missingFields.join(", ")}`,
        allowOutsideClick: false,
      });
      return;
    }

    const formObj = new FormData();
    formObj.append("sampleID", formData.sampleID);
    formObj.append("sealingDate", sealingDate);
    formObj.append("paymentTypes", formData.paymentTypes);
    formObj.append("sealDetails", formData.sealDetails);
    formObj.append("samples", JSON.stringify(formData.samples));
    formObj.append("di", formData.di);
    formObj.append("teamMembers", JSON.stringify(formData.teamMembers));

    if (formData.photographs) {
      formObj.append("photographs", formData.photographs);
    }
    if (formData.video) {
      formObj.append("video", formData.video);
    }
    setUploadPercentage(1);
    setIsLoading(true);
    axios
      .post(`${apiUrl}create-seal`, formObj, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadPercentage(percent);
        },
      })
      .then((response) => {
        console.log("Response:", response?.data);
        setUploadPercentage(0);
        if (photographRef?.current) photographRef.current.value = "";
        if (videoRef?.current) videoRef.current.value = "";
        Swal.fire({
          icon: "success",
          title: response?.data?.message,
        });
        setFormData({
          id: "",
          sealingDate: "",
          actualSealingDate: "",
          sealDetails: "",
          paymentTypes: "",
          samples: [],
          di: "",
          teamMembers: [],
          photographs: null,
          video: null,
        });
        getSealingList(token);
        setViewForm(false);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setDIData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Something went wrong!",
        });
        console.log(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    // List of required fields
    const requiredFields = [
      { key: "id", label: "ID" },
      { key: "sealingDate", label: "Sealing Date" },
      { key: "sealDetails", label: "Seal Details" },
      { key: "paymentTypes", label: "Fee Type" },
      { key: "samples", label: "Samples" },
      { key: "di", label: "DI Number" },
      { key: "teamMembers", label: "Team Members" },
    ];

    // Check for missing fields
    const missingFields = requiredFields
      .filter(
        (field) =>
          !formData[field.key] ||
          (Array.isArray(formData[field.key]) &&
            formData[field.key].length === 0)
      )
      .map((field) => field.label);

    // Show alert if any required field is missing
    if (missingFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: `Please fill the following fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    const formObj = new FormData();
    formObj.append("id", formData.id);
    formObj.append("sealingDate", formData.sealingDate);
    formObj.append("sealingDate", formData.actualSealingDate);
    formObj.append("sealDetails", formData.sealDetails);
    formObj.append("paymentTypes", formData.paymentTypes);
    formObj.append("samples", JSON.stringify(formData.samples));
    formObj.append("di", formData.di);
    formObj.append("teamMembers", JSON.stringify(formData.teamMembers));

    if (formData.photographs) {
      formObj.append("photographs", formData.photographs);
    }
    if (formData.video) {
      formObj.append("video", formData.video);
    }

    setIsLoading(true);
    axios
      .put(`${apiUrl}update-seal`, formObj, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        if (photographRef?.current) photographRef.current.value = "";
        if (videoRef?.current) videoRef.current.value = "";
        Swal.fire({
          icon: "success",
          title: response?.data?.message,
        });
        setFormData({
          id: "",
          sealingDate: "",
          actualSealingDate: "",
          sealDetails: "",
          paymentTypes: "",
          samples: [],
          di: "",
          teamMembers: [],
          photographs: null,
          video: null,
        });
        getSealingList(token);
        setViewForm(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setDIData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Something went wrong!",
        });
        console.log(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const photographRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0],
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
    const options = Array.from(e.target.selectedOptions, (option) =>
      JSON.parse(option.value)
    );
    setFormData({ ...formData, samples: options });
  };

  const deleteSealing = (id) => {
    setIsLoading(true);
    const data = {
      id: id,
    };
    axios
      .delete(`${apiUrl}delete-seal`, {
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
        getSealingList(token);
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
    if (formData.id !== "") {
      const seal = sealingList.find((seal) => seal._id === formData.id);
      console.log("Seal:", seal);
      setFormData({
        id: seal._id,
        sealingDate: setDateFormat(seal.sealingDate),
        actualSealingDate: setDateFormat(seal.actualSealingDate),
        sealDetails: seal.sealDetails,
        paymentTypes: seal.paymentTypes,
        samples: seal.samplesSelected.map(({ _id, ...rest }) => rest),
        di: seal.di,
        teamMembers: seal.teamMembersSelected.map(({ _id, ...rest }) => rest),
        photographs: null,
        video: null,
        sealedImage: seal.photographs,
        sealingVideo: seal.video,
      });
    } else {
      setFormData({
        id: "",
        sealingDate: "",
        actualSealingDate: "",
        sealDetails: "",
        paymentTypes: "",
        samples: [],
        di: "",
        teamMembers: [],
        photographs: null,
        video: null,
      });
    }
  }, [formData.id]);
  const downloadDoc = (doc) => {
    window.open(doc);
  };
  const handleMultiTeam = (e) => {
    const { name, value } = e.target;
    console.log(name);
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Updates the form data with the selected team members
    }));
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
  useEffect(() => {
    if (DIData && DIData.sealingDate) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        sealDetails: formatSealDetails(DIData.sealingDate),
      }));
    }
  }, [DIData]);
  const formatDate = (isoDate) => {
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
  const requsetSample = (sampleID) => {
    setIsLoading(true);
    const data = {
      sampleID,
    };
    axios
      .post(`${apiUrl}request-material-selected`, data, {
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
      })
      .catch((error) => {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: error?.response?.data?.message,
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  return (
    <form onSubmit={formData.id === "" ? handleSubmit : handleUpdate}>
      <div className="row">
        <DIAutosuggestion sampleData={handleData} />

        {console.log("sampleList:", sampleList)}
        {DIData && (
          <>
            <h3>Sample List</h3>
            {sampleList.length > 0 && (
              <div className="row mt-3 table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>DI</th>
                      <th>No. of Samples</th>
                      <th>Sealing done on</th>
                      <th>Samples</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleList.length > 0 ? (
                      sampleList.map((sample) => (
                        <tr key={sample._id}>
                          <td>{sample.di}</td>
                          <td>{sample.items.length}</td>
                          <td>{formatDate(sample.sealingDate)}</td>
                          <td>
                            {sample.items.map((item) => (
                              <div key={item._id}>
                                <p>
                                  {sample.communicateStoreCenterSampleDetails !==
                                    0 && (
                                    <>
                                      <strong>Unique Sample No.</strong>{" "}
                                      {item.itemID}, <strong>Line NO.</strong>{" "}
                                      {item.Line_NO}, <strong>GRN No.</strong>{" "}
                                      {item.grnNo},{" "}
                                    </>
                                  )}
                                  <strong>Material Name</strong>{" "}
                                  {item.materialName} <strong>Location</strong>{" "}
                                  {item.location}
                                </p>
                              </div>
                            ))}
                            {/* {sample.canDispatch === 1 && (
                              <span className="bg-dark text-white p-1 rounded">
                                Final Sample Selected
                              </span>
                            )} */}
                          </td>

                          <td>
                            {sample.communicateStoreCenterSampleDetails ===
                              1 && (
                              <button
                                className="btn btn-primary btn-sm float-end text-nowrap"
                                onClick={() => {
                                  setViewForm(true);
                                  setActionType("add");
                                  setFormData({
                                    ...formData,
                                    id: "",
                                    sampleID: sample._id,
                                  });
                                  getSample(token, sample._id);
                                  setTeamList(sample.teamMembers);
                                }}
                                type="button"
                              >
                                Add Sealing
                              </button>
                            )}
                            {sample.communicateStoreCenterSampleDetails ===
                              0 && (
                              <button
                                onClick={() => requsetSample(sample._id)}
                                className="btn btn-sm btn-success"
                                type="button"
                              >
                                Request Sample No.
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No Data Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <h3 className="my-3">
              {sealingList.length > 0 && "Sealings List"}
            </h3>

            {sealingList.length > 0 && (
              <div className="table-responsive">
                <div className="row justify-content-end">
                  <div className="col-lg-8">
                    <RecordLimit />
                  </div>
                </div>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>DI</th>
                      <th>Seal Details</th>
                      <th>Sealing Date&Time</th>
                      <th>Fee Type</th>
                      <th>Item Inclosed</th>
                      <th>Team Member</th>
                      <th style={{ width: "264px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sealingList.length > 0 ? (
                      sealingList.map((seal) => (
                        <tr key={seal._id}>
                          <td>{seal.di}</td>
                          <td>{seal.sealDetails}</td>
                          <td>{formatSealDetails(seal.sealingDate)}</td>
                          <td>{seal.paymentTypes || "NA"}</td>
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
                                {index + 1}. {member.memberName} ({member.role})
                              </div>
                            ))}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setOpen(true);
                                setFormData({
                                  ...formData,
                                  sealedImage: seal.photographs,
                                  sealingVideo: null,
                                });
                              }}
                            >
                              Images
                            </button>

                            <button
                              className="btn btn-info btn-sm mx-2"
                              type="button"
                              onClick={() => {
                                setOpen(true);
                                setFormData({
                                  ...formData,
                                  sealingVideo: seal.video,
                                  sealedImage: null,
                                });
                              }}
                            >
                              Videos
                            </button>

                            {sealingList[0]?.itemsSent?.length === 0 && (
                              <button
                                className="btn btn-danger btn-sm"
                                type="button"
                                onClick={() => {
                                  Swal.fire({
                                    title: "Are you sure?",
                                    text: "You want to delete this sealing?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonText: "Yes, delete it!",
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      deleteSealing(seal._id);
                                    }
                                  });
                                }}
                              >
                                Delete
                              </button>
                            )}
                            {/* <button
                              className="btn btn-warning btn-sm ms-2"
                              type="button"
                              onClick={() => {
                                setViewForm(true);
                                setActionType("edit");
                                getTeam();
                                setFormData({
                                  ...formData,
                                  id: seal._id,
                                });
                                getSample(token, seal.samplesSelected[0]._id);
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
            )}
          </>
        )}
        {DIData && viewForm && (
          <>
            {isLoading && <Loader />}
            <div className="custom-modal-overlay">
              <div className="modal-dialog-centered p-4">
                <div className="modal-content">
                  <div
                    className="modal-header"
                    style={{ justifyContent: "space-between" }}
                  >
                    <h5 className="">
                      {formData.id === "" ? "Add" : "Update"} Sealing Detail
                    </h5>
                    <button
                      type="button"
                      className="btn-close float-end"
                      onClick={() => {
                        getSample(token);
                        setViewForm(false);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label">
                          Select Team Members
                        </label>
                        <Multiselect
                          options={teamList.map((team) => ({
                            id: team._id,
                            memberName: team.memberName,
                            mobileNo: team.mobileNo,
                            role: team.role,
                            email: team.email,
                          }))}
                          selectedValues={formData.teamMembers}
                          onSelect={(selectedList) => {
                            handleMultiTeam({
                              target: {
                                name: "teamMembers",
                                value: selectedList,
                              },
                            });
                          }}
                          onRemove={(selectedList) => {
                            handleMultiTeam({
                              target: {
                                name: "teamMembers",
                                value: selectedList,
                              },
                            });
                          }}
                          displayValue="memberName"
                          placeholder="Select Team Member"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Selected Samples</label>
                        <Multiselect
                          options={sampleList[0]?.items.map((item) => ({
                            grnNo: item.grnNo,
                            itemID: item.itemID,
                          }))} // Map items for the dropdown
                          selectedValues={sampleList[0]?.items.map((item) => ({
                            grnNo: item.grnNo,
                            itemID: item.itemID,
                          }))} // Set all options as initially selected
                          onSelect={(selectedList) => {
                            handleMultiSelectChange({
                              target: {
                                name: "samples",
                                value: selectedList,
                              },
                            });
                          }}
                          onRemove={(selectedList) => {
                            handleMultiSelectChange({
                              target: {
                                name: "samples",
                                value: selectedList,
                              },
                            });
                          }}
                          disable
                          displayValue="itemID" // Display itemID in the dropdown
                          placeholder="Select Sample"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          Date allocated for sealing
                        </label>

                        <input
                          className="form-control"
                          value={formData.sealingDate}
                          readOnly
                          name="sealingDate"
                        />
                      </div>
                      <div className="col-md-4 my-3">
                        <label className="form-label">
                          Actual sealing date
                        </label>

                        <input
                          className="form-control"
                          value={
                            formData.actualSealingDate ||
                            dayjs(
                              formData.sealingDate,
                              "DD-MM-YYYY h:mm A"
                            ).format("YYYY-MM-DD")
                          }
                          type="date"
                          name="actualSealingDate"
                          min={dayjs(
                            formData.sealingDate,
                            "DD-MM-YYYY h:mm A"
                          ).format("YYYY-MM-DD")}
                          onChange={(e) => {
                            const allocatedDate = dayjs(
                              formData.sealingDate,
                              "DD-MM-YYYY h:mm A"
                            ).format("YYYY-MM-DD");
                            if (
                              allocatedDate === e.target.value ||
                              allocatedDate < e.target.value
                            ) {
                              handleChange(e);
                            } else {
                              Swal.fire({
                                icon: "warning",
                                title:
                                  "Actual sealing date should be greater than or equal to allocated date",
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="col-md-4 my-3">
                        <label className="form-label">Sealing Details</label>
                        <input
                          type="text"
                          name="sealDetails"
                          className="form-control"
                          value={formData.sealDetails}
                          onChange={handleChange}
                          placeholder="Enter Sealing Details"
                          required
                        />
                      </div>
                      <div className="col-md-4 my-3">
                        <label className="form-label">Fee Type</label>
                        <select
                          name="paymentTypes"
                          className="form-control"
                          value={formData.paymentTypes}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Fee Type</option>
                          <option value="Pre Paid">Pre Paid</option>
                          <option value="Post Paid">Post Paid</option>
                        </select>
                      </div>
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Upload</th>
                            <th style={{ width: "150px" }}>Download</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Sealing Photos</td>
                            <td>
                              <input
                                type="file"
                                id="photographs"
                                name="photographs"
                                className="form-control"
                                ref={photographRef}
                                multiple
                                onChange={handleFileChange}
                                accept="image/*"
                              />
                            </td>
                            <td align="center">
                              {actionType === "edit" &&
                                formData.sealedImage !== "" && (
                                  <button
                                    className="btn btn-success btn-sm"
                                    type="button"
                                    onClick={() =>
                                      downloadDoc(formData.sealedImage[0])
                                    }
                                  >
                                    Download
                                  </button>
                                )}
                            </td>
                          </tr>
                          <tr>
                            <td>Sealing Video</td>
                            <td>
                              <input
                                type="file"
                                id="video"
                                name="video"
                                className="form-control"
                                ref={videoRef}
                                onChange={handleFileChange}
                                accept="video/*"
                              />
                              <ProgressBar
                                uploadPercentage={uploadPercentage}
                              />
                            </td>
                            <td align="center">
                              {actionType === "edit" &&
                                formData.sealingVideo !== "" && (
                                  <button
                                    className="btn btn-success btn-sm"
                                    type="button"
                                    onClick={() =>
                                      downloadDoc(formData.sealingVideo[0])
                                    }
                                  >
                                    Download
                                  </button>
                                )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-12">
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={uploadPercentage > 0 || isSubmitting}
                      >
                        {formData.id === ""
                          ? isSubmitting
                            ? "Submitting..."
                            : "Submit Details"
                          : isSubmitting
                          ? "Updating..."
                          : "Update Details"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {open && (
        <div className="custom-modal-overlay">
          <div className="modal-dialog-centered p-4">
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ justifyContent: "space-between" }}
              >
                <h5 className="">
                  Sealing {formData.sealedImage ? `Images` : `Videos`}
                </h5>
                <button
                  type="button"
                  className="btn-close float-end"
                  onClick={() => setOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div
                  id="carouselExampleControls"
                  className="carousel slide"
                  data-bs-ride="carousel"
                  style={{
                    maxHeight: "90vh",
                    overflow: "hidden",
                  }}
                >
                  <div className="carousel-inner">
                    {formData.sealedImage
                      ? formData.sealedImage.map((image, index) => (
                          <div
                            className={`carousel-item ${
                              index === 0 && "active"
                            }`}
                            key={index + "_" + image}
                          >
                            <img
                              src={image}
                              className="d-block w-100"
                              alt={`Sample ${index + 1}`}
                            />
                          </div>
                        ))
                      : formData.sealingVideo.map((video, index) => (
                          <div
                            className={`carousel-item ${
                              index === 0 && "active"
                            }`}
                            key={index + "_" + video}
                          >
                            <video
                              src={video}
                              className="d-block w-100"
                              controls
                              alt={`Sample ${index + 1}`}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        ))}
                  </div>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#carouselExampleControls"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#carouselExampleControls"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default SealingDetails;
