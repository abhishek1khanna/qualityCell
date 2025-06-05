import axios from "axios";
import React, { useEffect, useState } from "react";
import { apiUrl, dateFormat, setDateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import DIAutosuggestion from "../../component/DIAutosuggestion";
import { useUserContext } from "../../utils/userContext";
import Pagination from "../../component/Pagination";
import RecordLimit from "../../component/RecordLimit";

function ViewSelectedSample() {
  const { limit } = useUserContext();
  const [DIData, setDIData] = useState(null);
  const [selctedSampleList, setSelectedSampleList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleData = (data) => {
    setDIData(data);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && DIData) {
      console.log("DI: ", DIData);
      getSelectedSample(token);
    } else {
      setSelectedSampleList([]);
    }
  }, [DIData, limit, currentPage]);
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);
  const getSelectedSample = (token) => {
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
        let tempArr = response?.data?.data
          .map((sample) => sample.samplesSelected)
          .flat(1);
        console.log("tempArr", tempArr);
        setSelectedSampleList(tempArr);
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
    <div className="row">
      <DIAutosuggestion sampleData={handleData} />
      {DIData && selctedSampleList && selctedSampleList.length > 0 && (
        <>
          <h4>Selected Sample</h4>
          {/* <div className="row justify-content-end">
            <div className="col-lg-8">
              <RecordLimit />
            </div>
          </div> */}
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>GRN No.</th>
                <th>Location</th>
                <th>Material Name</th>
                <th>Line No.</th>
                <th>Items</th>
                <th>Test Result</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
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
                  <td colSpan={8} align="center">
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
          )}
        </>
      )}
    </div>
  );
}

export default ViewSelectedSample;
