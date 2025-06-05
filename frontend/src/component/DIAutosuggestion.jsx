import axios from "axios";
import { apiUrl, dateFormat } from "../constant/constant";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import Swal from "sweetalert2";

function DIAutosuggestion({ sampleData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [DIData, setDIData] = useState(null);
  const [diList, setDiList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [grn, setGrn] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, [searchTerm]);

  function getSample() {
    if (searchTerm === "") {
      Swal.fire({
        icon: "warning",
        title: "Please enter DI first",
      });
      return;
    }
    setIsLoading(true);

    const data = {
      di: searchTerm,
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
        //console.log("Response:", response?.data);
        const location = JSON.parse(localStorage.getItem("Quality_Cell_Data"));
        const name = location?.role?.office?.name.toLowerCase();
        const role = location?.role?.role?.role.toLowerCase();
        let grnResponse = response?.data?.data[0].Data;
        /* if (
          role !== "uqc" &&
          role !== "dqc" &&
          role !== "material management unit"
        ) {
          grnResponse = response?.data?.data[0].Data.filter((data) =>
            name.includes(data.Store_Location.toLowerCase())
          );
        } */
        //console.log(name, response?.data?.data[0].Data);

        //console.log(grnResponse);
        setDiList(grnResponse);
        setDIData(response?.data?.data[0]);
        sampleData(response?.data?.data[0]);
      })
      .catch((error) => {
        setIsLoading(false);
        setDIData(null);
        sampleData(null);
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
    if (DIData && DIData._id !== "") {
      //console.log(DIData._id);
      getGrn(DIData._id);
    }
  }, [DIData]);
  const getGrn = (materialId) => {
    return;
    setIsLoading(true);
    const data = {
      materialID: materialId,
    };
    axios
      .post(`${apiUrl}list-grn`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        console.log("Response:", response?.data);
        setGrn(response.data?.data || []);
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
    <div>
      {isLoading && <Loader />}
      <div className="mb-3">
        <div className="row">
          <label htmlFor="di" className="form-label">
            DI (from ERP or manually enter)
          </label>
          <div className="col-md-4">
            <input
              type="text"
              id="di"
              name="di"
              className="form-control"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Enter DI"
              required
            />
          </div>
          <div className="col-md-6">
            <button
              className="btn btn-primary"
              type="button"
              disabled={isLoading}
              onClick={getSample}
            >
              {isLoading ? `Searching...` : `Search`}
            </button>
          </div>
        </div>
      </div>
      {DIData && (
        <>
          <div className="container my-4 bg-light p-4">
            <div className="row">
              <div className="col-lg-6">
                <p>
                  <strong>DI: </strong>
                  {DIData?.di}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>Name of the Firm: </strong>
                  {DIData?.Name_of_the_Firm}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>Supplier Address: </strong>
                  {DIData?.Supplier_Address}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>Supplier email: </strong>
                  {DIData?.Supplier_email}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>Supplier Mobile No: </strong>
                  {DIData?.Supplier_Mobile_No}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>PO No: </strong>
                  {DIData?.PONo}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>PO Quantity: </strong>
                  {DIData?.POQuantity}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>Bank Guarantee Amount: </strong>
                  {DIData?.bankGuaranteeAmount}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>BG Expiry Date: </strong>
                  {DIData.BGExpiryDate && dateFormat(DIData.BGExpiryDate)}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>BG Expiry Date: </strong>
                  {DIData?.materialTag}
                </p>
              </div>
              <div className="col-lg-6">
                <p>
                  <strong>Material Tag:</strong>
                  {DIData?.materialTag}
                </p>
              </div>

              {diList.length > 0 && (
                <table className="table table-bordered table-transparent">
                  <thead>
                    <tr>
                      <th>Line No</th>
                      <th>Material Name</th>
                      <th>Mat Group</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Contract No.</th>
                      <th>Plant</th>
                      <th>Store Location</th>
                      <th>Tests</th>
                      <th>Labs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diList?.map((data, index) => (
                      <tr key={data.Material_Code + "-" + index}>
                        <td>{data.Line_NO}</td>
                        <td>{data.Material_Name}</td>
                        <td>{data.Mat_Group}</td>
                        <td>{data.Quantity}</td>
                        <td>{data.Price}</td>
                        <td>{data.Contract_No}</td>
                        <td>
                          {data.Plant_Name}({data.Plant})
                        </td>
                        <td>{data.Store_Location}</td>
                        <td>
                          {data.tests.map((test) => (
                            <div key={test}>{test}</div>
                          ))}
                        </td>
                        <td>
                          {data.labs.map((lab) => (
                            <div key={lab}>{lab}</div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default DIAutosuggestion;
