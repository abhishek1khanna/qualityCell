import React, { useState } from "react";

function TestResults() {
  const [searchTerm, setSearchTerm] = useState("");
  const [testResults, setTestResults] = useState([
    {
      id: 1,
      di: "001",
      sampleDetails: "Sample A",
      testResults: "Passed",
      notice: "notice_a.pdf",
      penaltyOM: "penalty_a.pdf",
      recovery: true,
      recoveryAmount: "5000",
      debarmentOM: "debarment_a.pdf",
    },
    {
      id: 2,
      di: "002",
      sampleDetails: "Sample B",
      testResults: "Failed",
      notice: "notice_b.pdf",
      penaltyOM: null,
      recovery: false,
      recoveryAmount: "",
      debarmentOM: null,
    },
    {
      id: 3,
      di: "003",
      sampleDetails: "Sample C",
      testResults: "Pending",
      notice: null,
      penaltyOM: null,
      recovery: false,
      recoveryAmount: "",
      debarmentOM: null,
    },
  ]);

  const filteredResults = testResults.filter((result) =>
    result.di.includes(searchTerm)
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div
          className="card-header d-flex justify-content-between align-items-center"
          style={{
            background: "linear-gradient(to right, #2c3e50, #f39c12)",
          }}
        >
          <h4 className="mb-0 text-white">View Action---</h4>
          <input
            type="text"
            className="form-control w-25"
            placeholder="Search by DI"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead
                style={{
                  background: "#2c3e50",
                  color: "#fff",
                }}
              >
                <tr>
                  <th>DI</th>
                  <th>Sample Details</th>
                  <th>Test Results</th>
                  <th>Notice</th>
                  <th>Penalty OM</th>
                  <th>Recovery</th>
                  <th>Recovery Amount</th>
                  <th>Debarment OM</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <tr key={result.id}>
                      <td>{result.di}</td>
                      <td>{result.sampleDetails}</td>
                      <td>{result.testResults}</td>
                      <td>
                        {result.notice ? (
                          <a
                            href={result.notice}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        {result.penaltyOM ? (
                          <a
                            href={result.penaltyOM}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>{result.recovery ? "Yes" : "No"}</td>
                      <td>{result.recoveryAmount || "N/A"}</td>
                      <td>
                        {result.debarmentOM ? (
                          <a
                            href={result.debarmentOM}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm">View</button>
                        <button className="btn btn-warning btn-sm mx-2">
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestResults;
