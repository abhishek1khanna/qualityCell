import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { apiUrl, dateFormat, setDateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import DIAutosuggestion from "../../component/DIAutosuggestion";
import { useUserContext } from "../../utils/userContext";
import RecordLimit from "../../component/RecordLimit";

function AddTestResults() {
  const { limit } = useUserContext();
  const [DIData, setDIData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewList, setViewList] = useState(false);
  const [viewIndividual, setViewIndividual] = useState(false);
  const [sealingList, setSealingList] = useState([]);
  const [items, setItems] = useState([]);
  const [resultList, setResultList] = useState([]);
  const [viewForm, setViewForm] = useState(false);
  const [token, setToken] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState({
    sealId: "",
    testResultId: "",
    testName: "",
    result: "",
    testDate: "",
    notes: "",
    labName: "",
  });
  const [updates, setUpdates] = useState([]);
  const handleData = (data) => {
    setDIData(data);
    if (data === null) {
      setViewList(false);
      setViewIndividual(false);
      setSealingList([]);
      setItems([]);
      setResultList([]);
      setUpdates([]);
      setViewForm(false);
      setFormData({
        ...formData,
        testResultId: "",
        testName: "",
        result: "",
        testDate: "",
        notes: "",
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

  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);

  useEffect(() => {
    if (formData.sealId !== "") {
      getResult(formData.sealId);
    }
  }, [limit, currentPage]);

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
  useEffect(() => {
    if (items.length > 0) {
      const initialUpdates = items.flatMap((item) => {
        const tests = [...item.testToPerform];
        if (item.additionalTestRequired === "yes") {
          tests.push(
            "Lightening Impulse Voltage Withstand Test",
            "Short Circuit Withstand (Thermal and Dynamic Ability) Test"
          );
        }

        return tests
          .map((test) => {
            const existingResult = item.testResults?.find(
              (r) => r.testName === test
            );
            if (!existingResult) return null;

            return {
              itemID: item.itemID,
              testName: test,
              testResult: existingResult.result,
              description: existingResult.notes,
              isAdditionalTest: !item.testToPerform.includes(test),
            };
          })
          .filter(Boolean);
      });

      setUpdates(initialUpdates);
    }
  }, [items]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      sealId: formData.sealId,
      testResultId: formData.testResultId,
      mode: formData.testResultId === "" ? "add" : "edit",
      testResult: {
        testName: formData.testName,
        result: formData.result,
        testDate: formData.testDate,
        notes: formData.notes,
        labName: formData.labName,
      },
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
        Swal.fire({
          icon: "success",
          title: response?.data?.message,
        });
        setViewForm(false);
        getResult(formData.sealId);
        setFormData({
          ...formData,
          testResultId: "",
          testName: "",
          result: "",
          testDate: "",
          notes: "",
          labName: "",
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

  const deleteResult = (testResultId) => {
    setIsLoading(true);
    const data = {
      testResultId,
      sealId: formData.sealId,
      mode: "delete",
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

        Swal.fire({
          icon: "success",
          title: response?.data?.message || "Result deleted successfully!",
        });

        // Refresh the result list after successful deletion
        if (formData.sealId) {
          getResult(formData.sealId);
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

  const saveIndividualResults = () => {
    setIsLoading(true);
    const data = {
      sealId: formData.sealId,
      updates: updates,
    };
    axios
      .post(`${apiUrl}update-test-result`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        Swal.fire({
          icon: "success",
          title: response?.data?.message,
        });
        setViewIndividual(false);
        getResult(formData.sealId);
        setUpdates([]);
      })
      .catch((error) => {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: error?.response?.data?.message || "Error saving results",
        });
      });
  };
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
                        <th style={{ width: "260px" }}>Action</th>
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
                                    {index + 1}. {sample.itemID} ({sample.grnNo}
                                    ) - {sample.finalSample}
                                  </div>
                                ))}
                              </td>
                              <td>
                                {seal.teamMembersSelected.map(
                                  (member, index) => (
                                    <div key={member._id}>
                                      {index + 1}. {member.memberName} (
                                      {member.role})
                                    </div>
                                  )
                                )}
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
                                <button
                                  type="button"
                                  className="btn btn-info btn-sm ms-2"
                                  onClick={() => {
                                    setViewIndividual(true);
                                    setFormData({
                                      ...formData,
                                      sealId: seal._id,
                                    });
                                    setItems(seal.samplesSelected);
                                  }}
                                >
                                  Individual Test
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
                    <th>Action</th>
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
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => {
                              Swal.fire({
                                title: "Are you sure?",
                                text: "You want to delete this result?",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "Yes, delete it!",
                              }).then((confirm) => {
                                if (confirm.isConfirmed) {
                                  deleteResult(result._id);
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
                                testName: result.testName,
                                testDate: setDateFormat(result.testDate),
                                labName: result.labName,
                                notes: result.notes,
                                result: result.result,
                                testResultId: result._id,
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
                    {formData.testResultId === "" ? `Add` : `Update`} Test
                    Results
                  </h5>
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={() => setViewForm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label">Test Name</label>
                        <input
                          type="text"
                          name="testName"
                          className="form-control"
                          value={formData.testName}
                          onChange={handleChange}
                          placeholder="Test Name"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Test Date</label>
                        <input
                          type="date"
                          name="testDate"
                          className="form-control"
                          value={formData.testDate}
                          onChange={handleChange}
                          max={new Date().toISOString().split("T")[0]}
                          placeholder="Test Date"
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Lab Name</label>
                        <input
                          type="text"
                          name="labName"
                          className="form-control"
                          value={formData.labName}
                          onChange={handleChange}
                          placeholder="Lab Name"
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
                      <div className="col-md-4 mt-3">
                        <label className="form-label">Result</label>
                        <input
                          type="text"
                          name="result"
                          className="form-control"
                          value={formData.result}
                          onChange={handleChange}
                          placeholder="Result"
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
                        {formData.testResultId === ""
                          ? `Submit Result`
                          : `Update Result`}
                      </button>
                    </div>
                  </>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {viewIndividual && (
        <div className="custom-modal-overlay">
          <div
            className="modal-dialog-centered p-4"
            style={{ maxWidth: "90%" }}
          >
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ justifyContent: "space-between" }}
              >
                <h5 className="">Individual Test Results</h5>
                <button
                  type="button"
                  className="btn-close float-end"
                  onClick={() => setViewIndividual(false)}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{
                  maxHeight: "85vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Lab</th>
                        <th>Test</th>
                        <th>Line</th>
                        <th>Material Name</th>
                        <th>Item ID</th>
                        <th>Location</th>
                        <th>Result</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? (
                        items.flatMap((item) => {
                          let testsToDisplay = [...item.testToPerform];

                          if (item.additionalTestRequired === "yes") {
                            testsToDisplay.push(
                              "Lightening Impulse Voltage Withstand Test",
                              "Short Circuit Withstand (Thermal and Dynamic Ability) Test"
                            );
                          }

                          return testsToDisplay.map((test, testIndex) => {
                            const lab =
                              testIndex < item.inLabs.length
                                ? item.inLabs[testIndex]
                                : item.inLabs[0] || "";

                            const isAdditionalTest =
                              item.additionalTestRequired === "yes" &&
                              testIndex >= item.testToPerform.length;

                            // Check if this test already has results in the updates state
                            const existingUpdate = updates.find(
                              (update) =>
                                update.itemID === item.itemID &&
                                update.testName === test
                            );

                            // Check if this test has results in the original data
                            const originalResult = item.testResults?.find(
                              (result) => result.testName === test
                            );

                            // Determine the prefilled values
                            const prefilledResult =
                              existingUpdate?.testResult ||
                              originalResult?.result ||
                              "";
                            const prefilledDescription =
                              existingUpdate?.description ||
                              originalResult?.notes ||
                              "";

                            return (
                              <tr key={`${item._id}-${testIndex}`}>
                                <td>{lab}</td>
                                <td>
                                  {test}
                                  {isAdditionalTest && (
                                    <span className="badge bg-dark">
                                      Additional Test
                                    </span>
                                  )}
                                </td>
                                <td>{item.Line_NO}</td>
                                <td>{item.materialName}</td>
                                <td>{item.itemID}</td>
                                <td>{item.location}</td>
                                <td>
                                  <select
                                    className="form-control"
                                    value={
                                      prefilledResult
                                        ? JSON.stringify({
                                            itemID: item.itemID,
                                            testResult: prefilledResult,
                                          })
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const selectedValue = JSON.parse(
                                        e.target.value
                                      );
                                      setUpdates((prevUpdates) => {
                                        const updatedUpdates =
                                          prevUpdates.filter(
                                            (update) =>
                                              update.itemID !==
                                                selectedValue.itemID ||
                                              update.testName !== test
                                          );
                                        updatedUpdates.push({
                                          ...selectedValue,
                                          testName: test,
                                          isAdditionalTest,
                                        });
                                        return updatedUpdates;
                                      });
                                    }}
                                  >
                                    <option value="">Select Result</option>
                                    <option
                                      value={JSON.stringify({
                                        itemID: item.itemID,
                                        testResult: "Fail",
                                      })}
                                    >
                                      Fail
                                    </option>
                                    <option
                                      value={JSON.stringify({
                                        itemID: item.itemID,
                                        testResult: "Pass",
                                      })}
                                    >
                                      Pass
                                    </option>
                                  </select>
                                </td>
                                <td>
                                  <input
                                    className="form-control"
                                    value={prefilledDescription}
                                    onChange={(e) => {
                                      const descriptionValue = e.target.value;
                                      setUpdates((prevUpdates) => {
                                        const updatedUpdates =
                                          prevUpdates.filter(
                                            (update) =>
                                              update.itemID !== item.itemID ||
                                              update.testName !== test
                                          );
                                        updatedUpdates.push({
                                          itemID: item.itemID,
                                          testName: test,
                                          isAdditionalTest,
                                          testResult: prefilledResult,
                                          description: descriptionValue,
                                          labName: lab,
                                        });
                                        return updatedUpdates;
                                      });
                                    }}
                                  />
                                </td>
                              </tr>
                            );
                          });
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="col-md-12">
                    <button
                      className="btn btn-primary"
                      onClick={() => saveIndividualResults()}
                      type="button"
                      disabled={isLoading}
                    >
                      Submit Result
                    </button>
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default AddTestResults;
