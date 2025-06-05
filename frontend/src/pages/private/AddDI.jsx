import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Multiselect from "multiselect-react-dropdown";
import Loader from "../../component/Loader";
import { apiUrl } from "../../constant/constant";

function AddDI() {
  const [isLoading, setIsLoading] = useState(false);
  const [testOptions, setTestOptions] = useState({});
  const [labOptions, setLabOptions] = useState([]);
  const [viewForm, setViewForm] = useState(false);
  const [testCategoryOptions, setTestCategoryOptions] = useState([]);
  const [token, setToken] = useState("");
  const [materialTagOptions] = useState([
    "Transformer above 200 kVA",
    "Transformer below 200 kVA",
    "Meter",
    "Cable",
    "Conductor",
    "Pole",
    "Workshop Material",
    "Other Materials",
  ]);
  const [formData, setFormData] = useState({
    di: "",
    Name_of_the_Firm: "",
    Supplier_Address: "",
    Supplier_Mobile_No: "",
    Supplier_email: "",
    Supplier_GST: "",
    PONo: "",
    POQuantity: "",
    bankGuaranteeAmount: "",
    BGExpiryDate: "",
    materialTag: "",
    Data: [],
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const fetchTestCategory = () => {
    fetchData("manageCategory", { action: "list" }, setTestCategoryOptions);
  };
  const applyTestCategoryToAll = () => {
    if (formData.Data.length === 0) return;

    const firstRow = formData.Data[0];

    if (!firstRow.testCategory) {
      Swal.fire({
        icon: "warning",
        title: "Please select a test category in the first row first",
      });
      return;
    }

    // Get the tests and labs from the first row
    const firstRowTests = firstRow.tests || [];
    const firstRowLabs = firstRow.labs || [];

    // Update all rows with the same test category, tests, and labs
    setFormData((prev) => {
      const updatedData = prev.Data.map((row, index) => {
        if (index === 0) return row; // Skip the first row

        return {
          ...row,
          testCategory: firstRow.testCategory,
          tests: [...firstRowTests], // Copy the tests from first row
          labs: [...firstRowLabs], // Copy the labs from first row
        };
      });

      return { ...prev, Data: updatedData };
    });

    // Fetch tests for each row (if needed) and set labs
    formData.Data.forEach((_, index) => {
      if (index > 0) {
        fetchTest(firstRow.testCategory, index, true);
      }
    });
  };

  const fetchTest = (categoryID, rowIndex, selectAll = false) => {
    if (!categoryID) {
      if (!selectAll) {
        // Only show warning if not called from applyAll
        Swal.fire({
          icon: "warning",
          title: "Please select a test category first",
        });
      }
      return;
    }

    fetchData("manageTests", { action: "list", categoryID }, (tests) => {
      setTestOptions((prev) => ({
        ...prev,
        [rowIndex]: tests,
      }));

      // Automatically select all tests if selectAll is true
      if (selectAll && tests.length > 0) {
        setFormData((prev) => {
          const updatedData = [...prev.Data];
          updatedData[rowIndex] = {
            ...updatedData[rowIndex],
            tests: tests.map((item) => item.testName),
          };
          return { ...prev, Data: updatedData };
        });
      }
    });
  };

  const fetchLabs = () => {
    fetchData("manageLabs", { action: "list" }, setLabOptions);
  };

  const fetchData = (url, data, callback) => {
    setIsLoading(true);
    axios
      .post(`${apiUrl}${url}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        callback(response?.data?.data || []);
      })
      .catch((error) => {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.response?.data?.message || "Something went wrong",
        });
      });
  };

  const getDiData = () => {
    setIsLoading(true);
    axios
      .post(
        `${apiUrl}send-data`,
        { DIno: formData.di },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setIsLoading(false);
        if (response?.data?.data?.Data) {
          setViewForm(true);
          fetchTestCategory();
          fetchLabs();
          const {
            Data,
            Name_of_the_Firm,
            Supplier_Address,
            Supplier_GST,
            Supplier_Mobile_No,
            Supplier_email,
          } = response.data.data;
          console.log("----> ", Array.isArray(Data));
          setFormData((prev) => ({
            ...prev,
            Name_of_the_Firm: Name_of_the_Firm || "",
            Supplier_Address: Supplier_Address || "",
            Supplier_Mobile_No: Supplier_Mobile_No || "",
            Supplier_email: Supplier_email || "",
            Supplier_GST: Supplier_GST || "",
            Data: Array.isArray(Data)
              ? Data.map((item) => ({
                  ...item,
                  testCategory: "",
                  tests: item.tests || [],
                  labs: item.labs || [],
                }))
              : [Data],
          }));
        } else {
          setViewForm(false);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "DI not found",
          });
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.log("error", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error occurred while fetching from ERP",
        });
      });
  };
  const handleTestCategoryChange = (rowIndex, categoryID) => {
    setFormData((prev) => {
      const updatedData = [...prev.Data];
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        testCategory: categoryID,
        tests: [], // Will be populated after fetch
      };
      return { ...prev, Data: updatedData };
    });

    fetchTest(categoryID, rowIndex, true); // Pass true to select all tests
  };

  const handleTestSelection = (rowIndex, selectedList) => {
    console.log("Selected tests:", selectedList);
    setFormData((prev) => {
      const updatedData = [...prev.Data];
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        tests: selectedList.map((item) => item.testName),
      };
      return { ...prev, Data: updatedData };
    });
  };

  const handleLabSelection = (rowIndex, selectedList) => {
    setFormData((prev) => {
      const updatedData = [...prev.Data];
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        labs: selectedList.map((lab) => lab.labName),
      };
      return { ...prev, Data: updatedData };
    });
  };
  function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.Supplier_email === "" ||
      validateEmail(formData.Supplier_email) === false
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter valid email",
      });
      return;
    }
    if (
      formData.Supplier_Mobile_No === "" ||
      formData.Supplier_Mobile_No.toString().length !== 10
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter valid mobile number",
      });
      return;
    }
    if (formData.PONo === "") {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter PO number",
      });
    }

    if (formData.POQuantity === "") {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter PO Quantity",
      });
    }
    if (formData.bankGuaranteeAmount === "") {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter Bank Guarantee Amount",
      });
    }

    if (formData.BGExpiryDate === "") {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter BG Expiry Date",
      });
    }
    if (formData.materialTag === "") {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please Select Material Tag",
      });
    }
    console.log(formData.Data);
    if (
      !formData.Data.every(
        (item) =>
          !!item?.testCategory?.trim() &&
          Array.isArray(item?.tests) &&
          item.tests.length > 0 &&
          Array.isArray(item?.labs) &&
          item.labs.length > 0
      )
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select test category, test(s) and lab(s) for all materials",
      });
      return;
    }
    setIsLoading(true);
    const data = {
      di: formData.di,
      Name_of_the_Firm: formData.Name_of_the_Firm,
      Supplier_Address: formData.Supplier_Address,
      Supplier_Mobile_No: formData?.Supplier_Mobile_No?.toString() || "",
      Supplier_email: formData.Supplier_email,
      Supplier_GST: formData.Supplier_GST,
      PONo: formData.PONo,
      POQuantity: formData.POQuantity,
      bankGuaranteeAmount: formData.bankGuaranteeAmount,
      BGExpiryDate: formData.BGExpiryDate,
      materialTag: formData.materialTag,
      Data: formData.Data.map(({ testCategory, ...rest }) => ({
        ...rest,
        // Ensure tests and labs are arrays
        tests: Array.isArray(rest.tests) ? rest.tests : [],
        labs: Array.isArray(rest.labs) ? rest.labs : [],
      })),
    };

    console.log("Submitting data:", data);

    axios
      .post(`${apiUrl}add-material`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setIsLoading(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "DI Added Successfully",
        });
        setFormData({
          di: "",
          Name_of_the_Firm: "",
          Supplier_Address: "",
          Supplier_Mobile_No: "",
          Supplier_email: "",
          Supplier_GST: "",
          PONo: "",
          POQuantity: "",
          bankGuaranteeAmount: "",
          BGExpiryDate: "",
          materialTag: "",
          Data: [],
        });
        setViewForm(false);
      })
      .catch((error) => {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.response?.data?.message || "Error occurred",
        });
      });
  };
  return (
    <form>
      {isLoading && <Loader />}
      <div className="row">
        <div className="col-md-4 mb-3">
          <label htmlFor="di" className="form-label">
            DI (from ERP or manually enter)
          </label>
          <input
            type="text"
            id="di"
            name="di"
            className="form-control"
            value={formData.di}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, di: e.target.value }))
            }
            placeholder="Enter DI"
            required
          />
        </div>
        <div className="col-md-4 mb-3">
          <button
            className="btn btn-primary mt-4"
            type="button"
            onClick={getDiData}
          >
            Get DI from ERP
          </button>
        </div>
      </div>
      {viewForm && (
        <>
          <div className="row">
            <div className="col-lg-6">
              <p>
                <strong>Name of the Firm: </strong>
                {formData.Name_of_the_Firm}
              </p>
            </div>
            <div className="col-lg-6">
              <p>
                <strong>Supplier Address: </strong>
                {formData.Supplier_Address}
              </p>
            </div>
            <div className="col-lg-6">
              <div className="row">
                <div className="col-lg-4">
                  <strong>
                    Supplier email: <sup className="text-danger">*</sup>
                  </strong>
                </div>
                <div className="col-lg-8">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.Supplier_email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        Supplier_email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row">
                <div className="col-lg-4">
                  <strong>
                    Supplier Mobile No: <sup className="text-danger">*</sup>
                  </strong>
                </div>
                <div className="col-lg-8">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.Supplier_Mobile_No}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setFormData((prev) => ({
                          ...prev,
                          Supplier_Mobile_No: value,
                        }));
                      }
                    }}
                    maxLength="10"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Fields Section */}
          <div className="row mt-4">
            <div className="col-lg-6">
              <div className="row mb-3">
                <div className="col-lg-4">
                  <strong>
                    PO No:<sup className="text-danger">*</sup>
                  </strong>
                </div>
                <div className="col-lg-8">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.PONo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        PONo: e.target.value,
                      }))
                    }
                    placeholder="Enter PO No"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-lg-4">
                  <strong>
                    PO Quantity:<sup className="text-danger">*</sup>
                  </strong>
                </div>
                <div className="col-lg-8">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.POQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        POQuantity: e.target.value,
                      }))
                    }
                    placeholder="Enter PO Quantity"
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row mb-3">
                <div className="col-lg-4">
                  <strong>
                    Bank Guarantee Amount:<sup className="text-danger">*</sup>
                  </strong>
                </div>
                <div className="col-lg-8">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.bankGuaranteeAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bankGuaranteeAmount: e.target.value,
                      }))
                    }
                    placeholder="Enter Bank Guarantee Amount"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-lg-4">
                  <strong>
                    BG Expiry Date:<sup className="text-danger">*</sup>
                  </strong>
                </div>
                <div className="col-lg-8">
                  <input
                    type="date"
                    className="form-control"
                    value={formData.BGExpiryDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        BGExpiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-lg-4">
                  <strong>
                    Material Tag:<sup className="text-danger">*</sup>
                  </strong>
                </div>
                <div className="col-lg-8">
                  <select
                    className="form-control"
                    value={formData.materialTag}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        materialTag: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Material Tag</option>
                    {materialTagOptions.map((tag, index) => (
                      <option key={index} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Materials Table */}
          <div className="mt-5">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Quantity</th>
                  <th>Test Category</th>
                  <th>Test</th>
                  <th>Labs</th>
                  {formData.Data.length > 1 && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {formData.Data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.Material_Name}</td>
                    <td>{row.Quantity}</td>
                    <td>
                      <select
                        className="form-control"
                        value={row.testCategory}
                        onChange={(e) =>
                          handleTestCategoryChange(index, e.target.value)
                        }
                      >
                        <option value="">Select Category</option>
                        {testCategoryOptions.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Multiselect
                        options={testOptions[index] || []}
                        selectedValues={(testOptions[index] || []).filter(
                          (test) => row?.tests?.includes(test.testName)
                        )}
                        onSelect={(selectedList) =>
                          handleTestSelection(index, selectedList)
                        }
                        displayValue="testName"
                        placeholder="Select Test(s)"
                      />
                    </td>
                    <td>
                      <Multiselect
                        options={labOptions}
                        selectedValues={labOptions.filter(
                          (lab) =>
                            Array.isArray(row.labs) &&
                            row.labs.includes(lab.labName)
                        )}
                        onSelect={(selectedList) =>
                          handleLabSelection(index, selectedList)
                        }
                        displayValue="labName"
                        placeholder="Select Lab(s)"
                      />
                    </td>
                    {formData.Data.length > 1 && (
                      <td>
                        {index === 0 && (
                          <button
                            type="button"
                            className="btn btn-success mt-2 btn-sm"
                            onClick={applyTestCategoryToAll}
                          >
                            Apply to all
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            Add Material
          </button>
        </>
      )}
    </form>
  );
}

export default AddDI;
