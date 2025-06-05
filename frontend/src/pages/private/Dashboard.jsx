import { useEffect, useState } from "react";
import { apiUrl, dateFormat } from "../../constant/constant";
import axios from "axios";
import Loader from "../../component/Loader";
import Pagination from "../../component/Pagination";
import { useUserContext } from "../../utils/userContext";
import RecordLimit from "../../component/RecordLimit";

function Dashboard() {
  const { limit } = useUserContext();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredData, setFilteredData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      fetchRecords(storedToken);
    }
  }, [currentPage, limit]);
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);
  function fetchRecords(token) {
    setIsLoading(true);
    const data = {
      page: currentPage,
      limit: limit,
    };
    axios
      .post(`${apiUrl}generate-material-report`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        setRecords(response?.data?.data);
        setFilteredRecords(response?.data?.data); // Initialize filtered records
        setTotalPages(response?.data?.pagination?.totalPages);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error:", error);
      });
  }

  function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter records based on GRN No.
    const filtered = records.filter(
      (record) =>
        record.grnNo.toLowerCase().includes(query) ||
        record.di.toLowerCase().includes(query)
    );
    setFilteredRecords(filtered);
  }

  return (
    <div className="dashboard-container">
      {isLoading && <Loader />}
      <div className="row">
        <div className="search-bar col-lg-4 my-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by DI or GRN No."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="col-lg-8 my-3">
          <RecordLimit />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-primary">
            <tr>
              <th>DI</th>
              <th>GRN No.</th>
              <th>Received Date</th>
              <th>Material Received But Sample Not Created</th>
              <th>Team Not Created</th>
              <th>Sample Team Created But Sealing Not Done</th>
              <th>Sealing Done But Not Dispatched</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords && filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.di || "NA"}</td>
                  <td>{record.grnNo}</td>
                  <td>{dateFormat(record.receiveDate)}</td>
                  <td>
                    {record.sampleNotCreated > 0
                      ? parseInt(record.sampleNotCreated) - 1
                      : 0}{" "}
                    Days
                  </td>
                  <td>
                    {record.sampleTeamNotCreated > 0
                      ? parseInt(record.sampleTeamNotCreated) - 1
                      : 0}{" "}
                    Days
                  </td>
                  <td>
                    {record.sealingNotDone > 0
                      ? parseInt(record.sealingNotDone) - 1
                      : 0}{" "}
                    Days
                  </td>
                  <td>
                    {record.sealingDoneButNotDispatched > 0
                      ? parseInt(record.sealingDoneButNotDispatched) - 1
                      : 0}{" "}
                    Days
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No records found.
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
    </div>
  );
}

export default Dashboard;
