import axios from "axios";
import React, { useEffect, useState } from "react";
import { apiUrl, dateFormat, validateEmail } from "../../constant/constant";
import Swal from "sweetalert2";
import DIAutosuggestion from "../../component/DIAutosuggestion";
import ListDownload from "../../component/ListDownload";
import Loader from "../../component/Loader";

function CreateSamplingTeam() {
  const [DIData, setDIData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [viewTeam, setViewTeam] = useState(false);
  const [addTeam, setAddTeam] = useState(false);
  const [teamList, setTeamList] = useState([]);
  const [selectedMaterialData, setSelectedMaterialData] = useState(null);
  const [sampleList, setSampleList] = useState([]);
  const [formData, setFormData] = useState({
    sampleId: "",
    sealingDetailId: "",
    grnNo: "",
    sealDetails: "",
    sealingDate: "",
    sealedImage: null,
    sealingVideo: null,
    samplingTeam: [{ memberName: "", mobileNo: "", role: "", email: "" }],
    teamMemberId: "",
  });

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;
    if (dataset.index !== undefined) {
      const index = dataset.index;
      const field = dataset.field;
      const updatedTeam = [...formData.samplingTeam];
      updatedTeam[index][field] = value;
      setFormData({
        ...formData,
        samplingTeam: updatedTeam,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    if (validateEmail(formData.samplingTeam[0].email) === false) {
      setIsLoading(false);
      return Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
    }
    if (
      formData.samplingTeam[0].mobileNo === "" ||
      formData.samplingTeam[0].mobileNo.toString().length !== 10
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter valid mobile number",
      });
      return;
    }

    setIsLoading(true);
    const data = {
      di: DIData.di,
      sampleID: formData.sampleId,
      memberName: formData.samplingTeam[0].memberName,
      mobileNo: formData.samplingTeam[0].mobileNo,
      role: formData.samplingTeam[0].role,
      email: formData.samplingTeam[0].email,
    };
    axios
      .post(`${apiUrl}add-team`, data, {
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
        getSampleList();
        setFormData({
          ...formData,
          sampleId: "",
          samplingTeam: [{ memberName: "", mobileNo: "", role: "", email: "" }],
          teamMemberId: "",
        });
        setAddTeam(false);
      })
      .catch((error) => {
        setIsLoading(false);
        //setDIData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  const handleUpdate = (e) => {
    e.preventDefault();
    console.log(formData);
    if (validateEmail(formData.samplingTeam[0].email) === false) {
      setIsLoading(false);
      return Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
    }
    if (
      formData.samplingTeam[0].mobileNo === "" ||
      formData.samplingTeam[0].mobileNo.toString().length !== 10
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter valid mobile number",
      });
      return;
    }
    setIsLoading(true);
    const data = {
      memberName: formData.samplingTeam[0].memberName,
      sampleID: formData.sampleId,
      mobileNo: formData.samplingTeam[0].mobileNo,
      role: formData.samplingTeam[0].role,
      email: formData.samplingTeam[0].email,
      id: formData.teamMemberId,
    };
    axios
      .put(`${apiUrl}update-team`, data, {
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
        //getTeam(formData.sampleId);
        getSampleList();
        setFormData({
          ...formData,
          samplingTeam: [{ memberName: "", mobileNo: "", role: "", email: "" }],
          teamMemberId: "",
        });
        setAddTeam(false);
      })
      .catch((error) => {
        setIsLoading(false);
        //setDIData(null);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error?.response?.data?.message,
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error?.response?.data?.message);
      });
  };

  function getTeam(diId) {
    const data = {
      di: DIData.di,
    };
    axios
      .post(`${apiUrl}list-team`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setViewTeam(true);
        setIsLoading(false);
        console.log("Response:", response?.data);
        setTeamList(response?.data?.data);
      })
      .catch((error) => {
        setIsLoading(false);
        //setDIData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }

  function removeMember(memberId, sampleId) {
    const data = {
      sampleID: sampleId,
      memberId: memberId,
    };
    axios
      .delete(`${apiUrl}delete-team`, {
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
        getSampleList();
        //getTeam(formData.sampleId);
      })
      .catch((error) => {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error?.response?.data?.message,
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);
  useEffect(() => {
    if (DIData) {
      //getTeam();
      getSelectedGrns();
      getSampleList();
    }
  }, [DIData]);
  const handleData = (data) => {
    if (data) {
      console.log("data", data);
      setDIData(data);
      setViewTeam(false);

      setFormData({
        ...formData,
        sampleId: data._id,
      });
    }
  };
  const sendNotification = (sampleId) => {
    setIsLoading(true);
    const data = {
      sampleID: sampleId,
      di: DIData.di,
    };
    axios
      .post(`${apiUrl}notify-team`, data, {
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
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
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
  function getSelectedGrns() {
    const data = {
      materialID: DIData.di,
    };
    axios
      .post(`${apiUrl}list-grn-samples-selected`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        setSelectedMaterialData(response?.data?.data);
      })
      .catch((error) => {
        setIsLoading(false);
        setSelectedMaterialData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }
  const getSampleList = () => {
    setIsLoading(true);
    const data = {
      di: DIData?.di,
      page: 1,
      limit: 1000,
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
        //setTotalPages(response?.data?.totalPages);
      })
      .catch((error) => {
        setIsLoading(false);
        //setDIData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  return (
    <form onSubmit={formData.teamMemberId === `` ? handleSubmit : handleUpdate}>
      {isLoading && <Loader />}
      <DIAutosuggestion sampleData={handleData} />
      <>
        {selectedMaterialData && (
          <div>
            {selectedMaterialData.length > 0 && <h3>Selected GRN</h3>}
            {selectedMaterialData.length > 0
              ? selectedMaterialData.map((material, index) => (
                  <div
                    className={`row mt-3 p-3`}
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
                        <strong>GRN No.: </strong>
                        {material.grnNo}
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
                    <div className="col-lg-4">
                      <p>
                        <strong>Tags: </strong>
                        {material.associatedTags}
                      </p>
                    </div>
                    <div className="col-lg-12">
                      <p>
                        <strong>Receive Material List: </strong>
                        <ListDownload
                          data={material}
                          grnNo={material.grnNo}
                          year={material.year}
                        />
                      </p>
                    </div>
                  </div>
                ))
              : null}
          </div>
        )}
      </>
      {sampleList.length > 0 && (
        <div className="row mt-3">
          {sampleList.length > 0 && <h4>Sample Selected </h4>}
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
                  <>
                    <tr key={sample._id}>
                      <td>{sample.di}</td>
                      <td>{sample?.items?.length}</td>
                      <td>{formatDate(sample?.sealingDate)}</td>
                      <td>
                        {sample.items.map((item) => (
                          <div key={item._id}>
                            <p>
                              <strong>Line NO.</strong> {item.Line_NO},{" "}
                              <strong>GRN No.</strong> {item.grnNo},{" "}
                              <strong>Material Name</strong> {item.materialName}
                              , <strong>Location</strong> {item.location}
                            </p>
                          </div>
                        ))}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          onClick={() => {
                            setAddTeam(true);
                            setFormData({
                              ...formData,
                              sampleId: sample._id,
                              samplingTeam: [
                                {
                                  memberName: "",
                                  mobileNo: "",
                                  role: "",
                                  email: "",
                                },
                              ],
                              teamMemberId: "",
                            });
                          }}
                        >
                          Add Team Member
                        </button>
                        <button
                          className="btn btn-success btn-sm mt-2"
                          type="button"
                          disabled={isLoading}
                          onClick={() => {
                            sendNotification(sample._id);
                          }}
                        >
                          Notify Team Member
                        </button>
                      </td>
                    </tr>
                    {sample.teamMembers?.length > 0 &&
                      sample.teamMembers.map((team, i) => (
                        <tr key={sample._id + "-" + i}>
                          <td colSpan="5">
                            <div className="row">
                              <div className="col-lg-4">
                                <p>
                                  <strong>Team Member Name: </strong>
                                  {team.memberName}
                                </p>
                              </div>
                              <div className="col-lg-4">
                                <p>
                                  <strong>Mobile No: </strong>
                                  {team.mobileNo}
                                </p>
                              </div>
                              <div className="col-lg-4">
                                <p>
                                  <strong>Designation: </strong>
                                  {team.role}
                                </p>
                              </div>
                              <div className="col-lg-4">
                                <p>
                                  <strong>Email: </strong>
                                  {team.email}
                                </p>
                              </div>

                              <div className="col-lg-4">
                                <button
                                  className="btn btn-danger btn-sm"
                                  type="button"
                                  onClick={() => {
                                    setAddTeam(false);
                                    Swal.fire({
                                      title: "Are you sure?",
                                      text: "You want to remove this team member?",
                                      icon: "warning",
                                      showCancelButton: true,
                                      confirmButtonText: "Yes",
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        removeMember(team._id, sample._id);
                                      }
                                    });
                                  }}
                                >
                                  Remove Team
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {addTeam && (
        <>
          <div className="custom-modal-overlay">
            <div className="modal-dialog-centered p-4">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ justifyContent: "space-between" }}
                >
                  <h5 className="">
                    {formData.teamMemberId === "" ? "Add" : "Update"} Team
                    member
                  </h5>
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={() => setAddTeam(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {formData.samplingTeam.map((member, index) => (
                    <div className="row mb-3" key={index}>
                      <div className="col-md-4">
                        <label htmlFor={`name-${index}`} className="form-label">
                          Name
                        </label>
                        <input
                          type="text"
                          id={`name-${index}`}
                          name="memberName"
                          className="form-control"
                          data-index={index}
                          data-field="memberName"
                          value={member.memberName}
                          onChange={handleChange}
                          placeholder="Enter name"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label
                          htmlFor={`mobile-${index}`}
                          className="form-label"
                        >
                          Mobile
                        </label>
                        <input
                          type="number"
                          id={`mobile-${index}`}
                          name="mobileNo"
                          className="form-control"
                          data-index={index}
                          data-field="mobileNo"
                          value={member.mobileNo}
                          onChange={handleChange}
                          placeholder="Enter mobile"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label
                          htmlFor={`mobile-${index}`}
                          className="form-label"
                        >
                          Designation
                        </label>
                        <input
                          type="text"
                          id={`role-${index}`}
                          name="role"
                          className="form-control"
                          data-index={index}
                          data-field="role"
                          value={member.role}
                          onChange={handleChange}
                          placeholder="Enter Designation"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label
                          htmlFor={`mobile-${index}`}
                          className="form-label"
                        >
                          Email
                        </label>
                        <input
                          type="text"
                          id={`email-${index}`}
                          name="email"
                          className="form-control"
                          data-index={index}
                          data-field="email"
                          value={member.email}
                          onChange={handleChange}
                          placeholder="Enter Email"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <div className="col-md-12 mt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary"
                    >
                      {formData.teamMemberId === `` ? `Add` : `Update`} Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {viewTeam && (
        <>
          <h5 className="mb-4">
            {teamList.length > 0 && "Sampling Team Members"}{" "}
            <button
              className="btn btn-primary float-end"
              type="button"
              onClick={() => {
                setAddTeam(true);
                setFormData({
                  ...formData,
                  samplingTeam: [
                    { memberName: "", mobileNo: "", role: "", email: "" },
                  ],
                  teamMemberId: "",
                });
              }}
            >
              Add Team Member
            </button>
          </h5>
          <div className="row mb-3">
            {teamList.length > 0 && (
              <>
                <table className="table table-bordered align-middle table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>SN.</th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Designation</th>
                      <th>Email</th>
                      <th>Date</th>
                      <th style={{ width: "250px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamList.length > 0 ? (
                      teamList.map((member, index) => (
                        <tr key={member._id}>
                          <td>{index + 1}</td>
                          <td>{member.memberName}</td>
                          <td>{member.mobileNo}</td>
                          <td>{member.role}</td>
                          <td>{member.email || "NA-"}</td>
                          <td>{dateFormat(member.createdAt)}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm mx-3"
                              type="button"
                              onClick={() => {
                                setAddTeam(false);
                                Swal.fire({
                                  title: "Are you sure?",
                                  text: "You want to remove this team member?",
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonText: "Yes",
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    removeMember(member._id);
                                  }
                                });
                              }}
                            >
                              Remove Team
                            </button>
                            <button
                              className="btn btn-warning btn-sm"
                              type="button"
                              onClick={() => {
                                setAddTeam(true);
                                setFormData({
                                  ...formData,
                                  samplingTeam: [
                                    {
                                      memberName: member.memberName,
                                      mobileNo: member.mobileNo,
                                      email: member.email,
                                      role: member.role,
                                    },
                                  ],
                                  teamMemberId: member._id,
                                });
                              }}
                            >
                              Edit Team
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No team members found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="col-lg-12">
                  <button
                    type="button"
                    className="btn btn-success mt-3"
                    onClick={() => sendNotification()}
                  >
                    Send Notification
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </form>
  );
}

export default CreateSamplingTeam;
