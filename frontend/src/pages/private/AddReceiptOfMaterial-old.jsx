import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../constant/constant";
import Swal from "sweetalert2";
import Multiselect from "multiselect-react-dropdown";

function AddReceiptOfMaterial() {
  const [formData, setFormData] = useState({
    di: "",
    materialName: "",
    orderNo: "",
    firm: "",
    lab: "",
    test: [],
    grnNo: "",
    serialFrom: "",
    serialTo: "",
    description: "",
    quantity: "",
    sampleID: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [testOptions, setTestOptions] = useState([]);
  const [readOnly, setReadOnly] = useState(false);
  const [DIData, setDIData] = useState(null);
  const [token, setToken] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (name === "di") {
      console.log(value);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
      fetchTest(token);
    }
  }, [token]);

  function getSample() {
    const data = {
      di: formData.di,
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
        const data = response?.data?.data[0];
        console.log(data);
        setFormData((prevData) => ({
          ...prevData,
          //materialName: data?.materialName,
          orderNo: data?.purchaseOrderNo,
          firm: data?.firmName,
          lab: data?.labName,
          test: data?.tests.map((test) => test._id),
          quantity: data?.quantity,
          sampleID: data?._id,
        }));
        setReadOnly(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setReadOnly(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);

    const data = {
      materialID: formData.sampleID,
      grnNo: formData.grnNo,
      fromSerial: formData.serialFrom,
      toSerial: formData.serialTo,
      quantity: formData.quantity,
      identifyingParticulars: formData.description,
      materialName: formData.materialName,
    };
    axios
      .post(`${apiUrl}add-grn`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        setReadOnly(false);
        console.log("Response:", response?.data);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response?.data?.message,
        });
        setFormData({
          di: "",
          materialName: "",
          orderNo: "",
          firm: "",
          lab: "",
          test: [],
          grnNo: "",
          serialFrom: "",
          serialTo: "",
          description: "",
          quantity: "",
          sampleID: "",
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

  function fetchTest(token) {
    setIsLoading(true);
    const data = {
      action: "list",
    };
    axios
      .post(`${apiUrl}manageTests`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        setTestOptions(response?.data?.data);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }
  const handleSelect = (selectedList) => {
    setFormData({ ...formData, test: selectedList.map((item) => item._id) });
  };

  const handleRemove = (selectedList) => {
    setFormData({ ...formData, test: selectedList.map((item) => item._id) });
  };
  const diRef = useRef(null);
  return (
    <form onSubmit={handleSubmit}>
      {/* DI Field */}
      <div className="mb-3 row">
        <div className="col-md-5">
          <label htmlFor="di" className="form-label">
            DI (Search from existing DI or manually enter)
          </label>
          <input
            type="text"
            id="di"
            name="di"
            className="form-control"
            value={formData.di}
            onChange={handleChange}
            placeholder="Enter DI"
            required
            ref={diRef}
            readOnly={readOnly}
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="buttonReset" className="form-label d-block">
            &nbsp;
          </label>
          {readOnly ? (
            <button
              className="btn btn-warning"
              type="button"
              onClick={() => {
                setReadOnly(false);
                if (diRef.current) {
                  diRef.current.focus();
                }
                setFormData({
                  di: "",
                  materialName: "",
                  orderNo: "",
                  firm: "",
                  lab: "",
                  test: [],
                  grnNo: "",
                  serialFrom: "",
                  serialTo: "",
                  description: "",
                  quantity: "",
                  sampleID: "",
                });
              }}
            >
              Reset DI
            </button>
          ) : (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                getSample();
              }}
            >
              Search
            </button>
          )}
        </div>
      </div>
      {readOnly && (
        <>
          <div className="row mb-3">
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
              <strong>Tests Performed: </strong>
              {DIData?.tests.map((test) => (
                <div key={test._id}>{test.testName}</div>
              ))}
            </div>
            <table className="table table-bordered table-transparent">
              <thead>
                <tr>
                  <th>Line No</th>
                  <th>Material Name</th>
                  <th>Mat Group</th>
                  <th>Plant</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {DIData?.Data.map((data, index) => (
                  <tr key={data.Material_Name + "-" + index}>
                    <td>{data.Line_NO}</td>
                    <td>{data.Material_Name}</td>
                    <td>{data.Mat_Group}</td>
                    <td>{data.Plant}</td>
                    <td>{data.Quantity}</td>
                    <td>{data.Price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* GRN Number */}
            <div className="col-md-4">
              <label htmlFor="grnNo" className="form-label">
                GRN No.
              </label>
              <input
                type="text"
                id="grnNo"
                name="grnNo"
                className="form-control"
                value={formData.grnNo}
                onChange={handleChange}
                placeholder="Enter GRN Number"
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="grnNo" className="form-label">
                Select Material
              </label>
              <select
                value={formData.materialName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    materialName: e.target.value,
                  })
                }
                className="form-control"
                required
              >
                <option value={""}>Select Material</option>
                {DIData?.Data.map((marerial, index) => (
                  <option
                    key={marerial.Material_Name + "_" + index}
                    value={marerial.Material_Name}
                  >
                    {marerial.Material_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row with 2 Inputs for Serial Numbers */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="serialFrom" className="form-label">
                From Serial No.
              </label>
              <input
                type="number"
                id="serialFrom"
                name="serialFrom"
                className="form-control"
                value={formData.serialFrom}
                onChange={handleChange}
                placeholder="From Serial No."
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="serialTo" className="form-label">
                To Serial No.
              </label>
              <input
                type="number"
                id="serialTo"
                name="serialTo"
                className="form-control"
                value={formData.serialTo}
                onChange={handleChange}
                placeholder="To Serial No."
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Particular Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter Description"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="col-md-6">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              Add to Store
            </button>
          </div>
        </>
      )}
    </form>
  );
}

export default AddReceiptOfMaterial;
