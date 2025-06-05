import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { apiUrl, dateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import DIAutosuggestion from "../../component/DIAutosuggestion";
import { useUserContext } from "../../utils/userContext";
import Pagination from "../../component/Pagination";
import RecordLimit from "../../component/RecordLimit";

function AddPostTestResult() {
  const { limit } = useUserContext();
  const [DIData, setDIData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [selctedSampleList, setSelectedSampleList] = useState([]);
  const [viewList, setViewList] = useState(false);
  const [resultList, setResultList] = useState([]);
  const [sealingList, setSealingList] = useState([]);
  const [actionType, setActionType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState({
    di: "",
    action: "add",
    // Notice issued section
    noticeIssued: false,
    uploadNotice: null,
    // Material replaced section
    issuedToField: false,
    materialReplaced: false,
    // Financial penalty section
    financialPenalty: false,
    imposedAmount: "",
    recoveryAmount: "",
    uploadOMFinancialPenalty: null,
    // Bank guarantee section
    bankGuranteeAvailableAmount: "",
    bankGuranteeEncashAmount: "",
    // Debarment section
    firmBlacklisted: false,
    uploadOMDebarment: null,
    // Additional fields
    finalResult: "",
    details: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && DIData) {
      console.log("DI: ", DIData);
      getSelectedSample(token);
    } else {
      setSelectedSampleList([]);
    }
  }, [DIData, currentPage, limit]);
  const getSelectedSample = (token) => {
    setIsLoading(true);
    const data = {
      di: DIData.di,
      /* page: currentPage,
      limit: limit, */
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
        let tempArr = response?.data?.data.map((item) => item.samplesSelected);
        console.log("TempArr:", tempArr.flat(1));
        setSelectedSampleList(tempArr.flat(1));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    const formObj = new FormData();

    // Append basic fields
    formObj.append("di", formData.di || "");
    formObj.append("action", formData.action || "add");

    // Append all boolean fields
    formObj.append("noticeIssued", formData.noticeIssued);
    formObj.append("issuedToField", formData.issuedToField);
    formObj.append("materialReplaced", formData.materialReplaced);
    formObj.append("financialPenalty", formData.financialPenalty);
    formObj.append("firmBlacklisted", formData.firmBlacklisted);

    // Append amount fields
    formObj.append("imposedAmount", formData.imposedAmount || "0");
    formObj.append("recoveryAmount", formData.recoveryAmount || "0");
    formObj.append(
      "bankGuranteeAvailableAmount",
      formData.bankGuranteeAvailableAmount || "0"
    );
    formObj.append(
      "bankGuranteeEncashAmount",
      formData.bankGuranteeEncashAmount || "0"
    );

    // Append text fields
    formObj.append("finalResult", formData.finalResult || "");
    formObj.append("details", formData.details || "");

    // Append file inputs if they exist
    if (formData.uploadNotice) {
      formObj.append("uploadNotice", formData.uploadNotice);
    }
    if (formData.uploadOMFinancialPenalty) {
      formObj.append(
        "uploadOMFinancialPenalty",
        formData.uploadOMFinancialPenalty
      );
    }
    if (formData.uploadOMDebarment) {
      formObj.append("uploadOMDebarment", formData.uploadOMDebarment);
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}manage-post-test-action`,
        formObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      console.log("API Response:", response?.data);

      // Reset form and refs
      if (noticeRef?.current) noticeRef.current.value = "";
      if (penalityRef?.current) penalityRef.current.value = "";
      if (debarmentRef?.current) debarmentRef.current.value = "";
      setActionType("");
      setFormData({
        di: "",
        action: "add",
        noticeIssued: false,
        uploadNotice: null,
        issuedToField: false,
        materialReplaced: false,
        financialPenalty: false,
        imposedAmount: "",
        recoveryAmount: "",
        uploadOMFinancialPenalty: null,
        bankGuranteeAvailableAmount: "",
        bankGuranteeEncashAmount: "",
        firmBlacklisted: false,
        uploadOMDebarment: null,
        finalResult: "",
        details: "",
      });
      getSample(token);

      Swal.fire({
        icon: "success",
        title: response?.data?.message || "ATR submitted successfully!",
      });
    } catch (error) {
      setIsLoading(false);
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      console.error("Error:", error);

      Swal.fire({
        icon: "error",
        title: errorMessage,
      });

      setDIData(null);

      if (error?.response?.data?.message === "error in token") {
        console.log("Token error detected. Logging out...");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);

  const noticeRef = useRef(null);
  const penalityRef = useRef(null);
  const debarmentRef = useRef(null);
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0],
    });
  };
  const downloadDoc = (doc) => {
    window.open(doc);
  };

  const handleData = (data) => {
    setSealingList([]);
    setDIData(data);
    if (data) {
      setFormData({
        ...formData,
        di: data._id,
      });
    }
  };

  function getSample(token) {
    setIsLoading(true);
    const data = {
      di: DIData.di,
    };
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
        setDIData(response?.data?.data[0]);
        // Reset form when fetching new data
        setFormData({
          di: "",
          action: "add",
          noticeIssued: false,
          uploadNotice: null,
          issuedToField: false,
          materialReplaced: false,
          financialPenalty: false,
          imposedAmount: "",
          recoveryAmount: "",
          uploadOMFinancialPenalty: null,
          bankGuranteeAvailableAmount: "",
          bankGuranteeEncashAmount: "",
          firmBlacklisted: false,
          uploadOMDebarment: null,
          finalResult: "",
          details: "",
        });
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
  console.log("DIData:", DIData);
  useEffect(() => {
    if (DIData) {
      setActionType("");
      console.log("DIData or formData.di has changed:", DIData);
    }
  }, [DIData, formData.di]);
  const getResult = (sealId) => {
    setIsLoading(true);
    const data = {
      sealId: sealId,
      mode: "list",
      page: currentPage,
      limit: limit,
    };
    axios
      .post(`${apiUrl}manage-Test-Result`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        setResultList(response?.data?.data);
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
  return (
    <form onSubmit={handleSubmit}>
      <DIAutosuggestion sampleData={handleData} />

      {DIData && selctedSampleList && selctedSampleList.length > 0 && (
        <>
          <div className="row mb-2">
            <h4>
              {/* Selected Sample */}{" "}
              {console.log("selctedSampleList: ", selctedSampleList)}
              {sealingList.some(
                (seal) => seal.testResults && seal.testResults.length > 0
              ) && (
                <button
                  className="btn btn-primary float-end"
                  type="button"
                  onClick={() => {
                    if (DIData?.postTestAction?.details) {
                      setActionType("update");
                      setFormData({
                        di: DIData._id,
                        action: "update",
                        // Notice issued section
                        noticeIssued:
                          DIData.postTestAction.noticeIssued || false,
                        uploadNotice:
                          DIData.postTestAction.uploadNotice?.[0] || null,
                        // Material replaced section
                        issuedToField:
                          DIData.postTestAction.issuedToField || false,
                        materialReplaced:
                          DIData.postTestAction.materialReplaced || false,
                        // Financial penalty section
                        financialPenalty:
                          DIData.postTestAction.financialPenalty || false,
                        imposedAmount:
                          DIData.postTestAction.imposedAmount || "",
                        recoveryAmount:
                          DIData.postTestAction.recoveryAmount || "",
                        uploadOMFinancialPenalty:
                          DIData.postTestAction.uploadOMFinancialPenalty?.[0] ||
                          null,
                        // Bank guarantee section
                        bankGuranteeAvailableAmount:
                          DIData.postTestAction.bankGuranteeAvailableAmount ||
                          "",
                        bankGuranteeEncashAmount:
                          DIData.postTestAction.bankGuranteeEncashAmount || "",
                        // Debarment section
                        firmBlacklisted:
                          DIData.postTestAction.firmBlacklisted || false,
                        uploadOMDebarment:
                          DIData.postTestAction.uploadOMDebarment?.[0] || null,
                        // Additional fields
                        finalResult: DIData.postTestAction.finalResult || "",
                        details: DIData.postTestAction.details || "",
                      });
                    } else {
                      setFormData({
                        ...formData,
                        di: DIData._id,
                        action: "add",
                      });
                      setActionType("add");
                    }
                  }}
                >
                  Update Post Test ATR
                </button>
              )}
            </h4>
          </div>
          {/* <div className="row justify-content-end">
            <div className="col-lg-8">
              <RecordLimit />
            </div>
          </div> */}
          {/* <table className="table table-bordered table-striped mt-2">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>GRN No.</th>
                <th>Location</th>
                <th>Material Name</th>
                <th>Line No.</th>
                <th>Items</th>
                <th>Test Result</th>
                <th>Test Description</th>
              </tr>
            </thead>
            <tbody>
              {console.log("selctedSampleList: ", selctedSampleList)}
              {selctedSampleList && selctedSampleList.length > 0 ? (
                selctedSampleList.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{item.grnNo}</td>
                    <td>{item.location}</td>
                    <td>{item.materialName}</td>
                    <td>{item.Line_NO}</td>
                    <td>{item.itemID}</td>
                    <td>{item.testResult || "NA"}</td>
                    <td>{item.description || "NA"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} align="center">
                    No record found!
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
          )} */}
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
                      <td>Action</td>
                    </tr>
                  </thead>
                  <tbody>
                    {sealingList.length > 0 ? (
                      sealingList
                        .filter((seal) =>
                          seal.samplesSelected?.some(
                            (sample) => sample.finalSample === 1
                          )
                        )
                        .map((seal) => (
                          <tr key={seal._id}>
                            <td>{seal.di}</td>
                            <td>{seal.sealDetails}</td>
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
                                  getResult(seal._id);
                                  setFormData({
                                    ...formData,
                                    sealId: seal._id,
                                  });
                                }}
                              >
                                Results Summary
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
          {viewList && (
            <>
              <h3 className="mb-2">
                Test Results{" "}
                {/* <button
                          className="btn btn-primary float-end"
                          type="button"
                          onClick={() => setViewForm(true)}
                        >
                          Add Result
                        </button> */}
              </h3>
              {/* <div className="row justify-content-end">
                        <div className="col-lg-8">
                          <RecordLimit />
                        </div>
                      </div> */}
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Test Date</th>
                      <th>Lab Name</th>
                      <th>Note</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultList.length > 0 ? (
                      resultList.map((result) => (
                        <tr key={result._id}>
                          <td>{result.testName}</td>
                          <td>{dateFormat(result.testDate)}</td>
                          <td>{result.labName}</td>
                          <td>{result.notes}</td>
                          <td>{result.result}</td>
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
        </>
      )}
      {DIData && actionType !== "" && (
        <>
          <div className="custom-modal-overlay">
            <div className="modal-dialog-centered p-4">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ justifyContent: "space-between" }}
                >
                  <h5 className="text-capitalize">
                    {actionType} Post Test ATR
                  </h5>
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={() => setActionType("")}
                  ></button>
                </div>
                <div
                  className="modal-body"
                  style={{
                    maxHeight: "70vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  <div className="row g-3">
                    {/* Notice Issued to Firm */}
                    <div className="col-md-6">
                      <label className="form-label d-block">
                        Notice Issued to Firm
                      </label>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="noticeIssuedYes"
                          name="noticeIssued"
                          className="form-check-input"
                          checked={formData.noticeIssued}
                          onChange={() =>
                            setFormData({ ...formData, noticeIssued: true })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="noticeIssuedYes"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="noticeIssuedNo"
                          name="noticeIssued"
                          className="form-check-input"
                          checked={!formData.noticeIssued}
                          onChange={() =>
                            setFormData({ ...formData, noticeIssued: false })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="noticeIssuedNo"
                        >
                          No
                        </label>
                      </div>
                      {formData.noticeIssued && (
                        <div className="mt-2">
                          <div className="input-group">
                            <input
                              type="file"
                              id="uploadNotice"
                              name="uploadNotice"
                              className="form-control"
                              ref={noticeRef}
                              onChange={handleFileChange}
                            />
                            {formData.uploadNotice && (
                              <button
                                className="btn btn-success"
                                type="button"
                                onClick={() =>
                                  downloadDoc(formData.uploadNotice)
                                }
                              >
                                <i className="bi bi-download"></i> Download
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Material Replaced (only when not issued to field) */}
                    {!formData.issuedToField && (
                      <div className="col-md-6">
                        <label className="form-label d-block">
                          Material Replaced
                        </label>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="materialReplacedYes"
                            name="materialReplaced"
                            className="form-check-input"
                            checked={formData.materialReplaced}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                materialReplaced: true,
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="materialReplacedYes"
                          >
                            Yes
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            type="radio"
                            id="materialReplacedNo"
                            name="materialReplaced"
                            className="form-check-input"
                            checked={!formData.materialReplaced}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                materialReplaced: false,
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="materialReplacedNo"
                          >
                            No
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Financial Penalty */}
                    <div className="col-md-6">
                      <label className="form-label d-block">
                        Financial Penalty Imposed
                      </label>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="financialPenaltyYes"
                          name="financialPenalty"
                          className="form-check-input"
                          checked={formData.financialPenalty}
                          onChange={() =>
                            setFormData({ ...formData, financialPenalty: true })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="financialPenaltyYes"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="financialPenaltyNo"
                          name="financialPenalty"
                          className="form-check-input"
                          checked={!formData.financialPenalty}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              financialPenalty: false,
                            })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="financialPenaltyNo"
                        >
                          No
                        </label>
                      </div>
                      {formData.financialPenalty && (
                        <>
                          <label className="row mx-0 mt-2">Upload OM</label>
                          <div className="mt-2">
                            <div className="input-group">
                              <input
                                type="file"
                                id="uploadOMFinancialPenalty"
                                name="uploadOMFinancialPenalty"
                                className="form-control"
                                ref={penalityRef}
                                onChange={handleFileChange}
                              />
                              {formData.uploadOMFinancialPenalty && (
                                <button
                                  className="btn btn-success"
                                  type="button"
                                  onClick={() =>
                                    downloadDoc(
                                      formData.uploadOMFinancialPenalty
                                    )
                                  }
                                >
                                  <i className="bi bi-download"></i> Download
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="row mt-2">
                            <div className="col-md-6">
                              <label
                                htmlFor="imposedAmount"
                                className="form-label"
                              >
                                Amount Imposed (Rs.)
                              </label>
                              <input
                                type="number"
                                id="imposedAmount"
                                name="imposedAmount"
                                className="form-control"
                                value={formData.imposedAmount}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    imposedAmount: e.target.value,
                                  })
                                }
                                placeholder="Enter amount"
                              />
                            </div>
                            <div className="col-md-6">
                              <label
                                htmlFor="recoveryAmount"
                                className="form-label"
                              >
                                Amount Recovered (Rs.)
                              </label>
                              <input
                                type="number"
                                id="recoveryAmount"
                                name="recoveryAmount"
                                className="form-control"
                                value={formData.recoveryAmount}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    recoveryAmount: e.target.value,
                                  })
                                }
                                placeholder="Enter amount"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bank Guarantee */}
                    <div className="col-md-6">
                      <div className="row">
                        <div className="col-md-6">
                          <label
                            htmlFor="bankGuranteeAvailableAmount"
                            className="form-label"
                          >
                            Bank Guarantee Available (Rs.)
                          </label>
                          <input
                            type="number"
                            id="bankGuranteeAvailableAmount"
                            name="bankGuranteeAvailableAmount"
                            className="form-control"
                            value={formData.bankGuranteeAvailableAmount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                bankGuranteeAvailableAmount: e.target.value,
                              })
                            }
                            placeholder="Enter amount"
                          />
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="bankGuranteeEncashAmount"
                            className="form-label"
                          >
                            Bank Guarantee Encashed (Rs.)
                          </label>
                          <input
                            type="number"
                            id="bankGuranteeEncashAmount"
                            name="bankGuranteeEncashAmount"
                            className="form-control"
                            value={formData.bankGuranteeEncashAmount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                bankGuranteeEncashAmount: e.target.value,
                              })
                            }
                            placeholder="Enter amount"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Firm Debarred/Blacklisted */}
                    <div className="col-md-6">
                      <label className="form-label d-block">
                        Firm Debarred/Blacklisted
                      </label>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="firmBlacklistedYes"
                          name="firmBlacklisted"
                          className="form-check-input"
                          checked={formData.firmBlacklisted}
                          onChange={() =>
                            setFormData({ ...formData, firmBlacklisted: true })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="firmBlacklistedYes"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="firmBlacklistedNo"
                          name="firmBlacklisted"
                          className="form-check-input"
                          checked={!formData.firmBlacklisted}
                          onChange={() =>
                            setFormData({ ...formData, firmBlacklisted: false })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="firmBlacklistedNo"
                        >
                          No
                        </label>
                      </div>
                      {formData.firmBlacklisted && (
                        <div className="mt-2">
                          <label className="row mx-0 mt-2">Upload OM</label>
                          <div className="input-group">
                            <input
                              type="file"
                              id="uploadOMDebarment"
                              name="uploadOMDebarment"
                              className="form-control"
                              ref={debarmentRef}
                              onChange={handleFileChange}
                            />
                            {formData.uploadOMDebarment && (
                              <button
                                className="btn btn-success"
                                type="button"
                                onClick={() =>
                                  downloadDoc(formData.uploadOMDebarment)
                                }
                              >
                                <i className="bi bi-download"></i> Download
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Issue to Field */}
                    {/* <div className="col-md-6">
                      <label className="form-label d-block">
                        Issue to Field
                      </label>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="issuedToFieldYes"
                          name="issuedToField"
                          className="form-check-input"
                          checked={formData.issuedToField}
                          onChange={() =>
                            setFormData({ ...formData, issuedToField: true })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="issuedToFieldYes"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          type="radio"
                          id="issuedToFieldNo"
                          name="issuedToField"
                          className="form-check-input"
                          checked={!formData.issuedToField}
                          onChange={() =>
                            setFormData({ ...formData, issuedToField: false })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="issuedToFieldNo"
                        >
                          No
                        </label>
                      </div>
                    </div> */}
                  </div>

                  <div className="row g-3 mt-3">
                    {/* <div className="col-md-6">
                      <label htmlFor="finalResult" className="form-label">
                        Final Result
                      </label>
                      <input
                        type="text"
                        id="finalResult"
                        name="finalResult"
                        className="form-control"
                        value={formData.finalResult}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            finalResult: e.target.value,
                          })
                        }
                        placeholder="Enter final result"
                      />
                    </div> */}
                    <div className="col-md-6">
                      <label htmlFor="details" className="form-label">
                        Remark
                      </label>
                      <input
                        type="text"
                        id="details"
                        name="details"
                        className="form-control"
                        value={formData.details}
                        onChange={(e) =>
                          setFormData({ ...formData, details: e.target.value })
                        }
                        placeholder="Enter remark"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mt-3">
                    <div className="col-md-12">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {actionType === "add" ? "Submit" : "Update"} ATR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </form>
  );
}

export default AddPostTestResult;
