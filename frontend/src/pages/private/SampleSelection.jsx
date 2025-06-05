import React, { act, useEffect, useState } from "react";
import DIAutosuggestion from "../../component/DIAutosuggestion";
import axios from "axios";
import { apiUrl, dateFormat } from "../../constant/constant";
import Swal from "sweetalert2";
import Pagination from "../../component/Pagination";
import Loader from "../../component/Loader";
import ListDownload from "../../component/ListDownload";
import { pre } from "framer-motion/client";

const SampleSelection = () => {
  const [DIData, setDIData] = useState(null);
  const [sampleList, setSampleList] = useState([]);
  const [sealList, setSealList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [MaterialData, setMaterialData] = useState(null);

  const [finalSample, setFinalSample] = useState(false);
  const [selectedMaterialData, setSelectedMaterialData] = useState(null);
  const [viewForm, setViewForm] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [manualSample, setManualSample] = useState(false);
  const [communicationOption, setCommunicationOption] = useState(null);
  const [manualList, setManualList] = useState([]);
  const [additionalTest, setAdditionalTest] = useState(false);
  const [showAdditionalTest, setShowAdditionalTest] = useState(false);
  const [selectedSample, setSelectedSample] = useState("");
  const [additionalTestSample, setAdditionalTestSample] = useState("");
  const [preSampleList, setPreSampleList] = useState([]);
  const [extraTest, setExtraTest] = useState(null);
  const [transformerInfo, setTransformerInfo] = useState({
    suppliedQty: "",
    remainingQty: "",
    markedForTest: false,
    sampleNo: "",
  });

  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [role] = useState(
    JSON.parse(localStorage.getItem("Quality_Cell_Data")).role.role.role
  );
  const [formData, setFormData] = useState({
    di: "",
    numOfSamples: "",
    sealingDate: "",
    sealDetails: "",
  });
  const [token, setToken] = useState("");
  const handleData = (data) => {
    //console.log(data);
    setDIData(data);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && DIData) {
      setToken(token);
      getSampleList(token);
      getSealList(token);
      getGrns(token);
      getSelectedGrns(token);
    }
  }, [DIData, currentPage]);
  useEffect(() => {
    if (token !== "" && DIData) {
      preCreate("list");
    }
  }, [token, DIData]);
  useEffect(() => {
    if (DIData) {
      setViewForm(false);
      //console.log("DIData or formData.di has changed:", DIData);
    }
  }, [DIData, formData.di]);

  const getSampleList = (token) => {
    //console.log("DIData:", DIData);

    setIsLoading(true);

    const data = {
      di: DIData?.di,
      page: currentPage,
      limit: 25,
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
        //console.log("Response:", response?.data);
        setSampleList(response?.data?.data);
        setTotalPages(response?.data?.totalPages);
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

  const getSealList = (token) => {
    setIsLoading(true);
    const data = {
      di: DIData?.di,
      page: currentPage,
      limit: 25,
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
        //console.log("Response:", response?.data);
        setSealList(response?.data?.data);
        setTotalPages(response?.data?.totalPages);
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

  function getTeam() {
    setIsLoading(true);
    const data = {
      di: DIData?._id,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    let isValid = false;
    if (role !== "UPPCL_DIRD_UPPCL") {
      isValid = checkedItems.some((item) => {
        const material = MaterialData.find((m) => m._id === item.id);
        return material?.associatedTags
          ?.trim()
          .toLowerCase()
          .includes("transformer" || "meter" || "vcb");
      });
    } else {
      isValid = isTransformer;
    }

    if (manualSample && manualList.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Please select an Item",
      });
      return;
    }
    console.log("isTransformer: ", isValid);
    const data = {
      di: DIData?.di,
      numOfSamples: formData.numOfSamples,
      sealingDate: formData.sealingDate,
      checkedItems: checkedItems,
      communicateStoreCenterSampleDetails: isValid
        ? communicationOption
        : undefined,
      preSampleID: selectedSampleId ? selectedSampleId : undefined,
      additionalTestRequired: transformerInfo.markedForTest ? "yes" : "no",
      uniqueSampleNo: transformerInfo.sampleNo,
      checkedSamplesItems: manualSample ? manualList : undefined,
      manual: manualSample ? "1" : undefined,
    };
    axios
      .post(`${apiUrl}create-sample`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        Swal.fire({
          icon: "success",
          title: response?.data?.message,
        });
        setFormData({
          ...formData,
          numOfSamples: "",
          sealingDate: "",
          sealDetails: "",
        });
        getSampleList(token);
        getSealList(token);
        setViewForm(false);
      })
      .catch((error) => {
        setIsLoading(false);
        //setDIData(null);
        Swal.fire({
          icon: "error",
          title: error?.response?.data?.message || "Something went wrong.",
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };

  const preCreate = (mode, sampleId = "") => {
    let data = {};
    if (mode === "list") {
      data = {
        di: DIData.di,
        action: mode,
      };
    } else if (mode === "delete") {
      data = {
        di: DIData.di,
        action: mode,
        id: sampleId,
      };
    } else {
      const isTransformer = checkedItems.some((item) => {
        const material = MaterialData.find((m) => m._id === item.id);
        return material?.associatedTags
          ?.trim()
          .toLowerCase()
          .includes("transformer" || "meter" || "vcb");
      });
      if (isTransformer && communicationOption === null) {
        Swal.fire({
          icon: "error",
          title:
            "Please select a communication option for the transformer sample",
        });
        return;
      }
      data = {
        di: formData.di,
        checkedItems: checkedItems.map((item) => item.id),
        numOfSamples: formData.numOfSamples,
        sealingDate: formData.sealingDate,
        sealDetails: "",
        action: mode,
      };
    }

    console.log(data, formData);
    axios
      .post(`${apiUrl}pre-create-sample`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        if (mode === "add" || mode === "delete") {
          Swal.fire({
            icon: "success",
            title: response?.data?.message,
          });
          preCreate("list");
        } else {
          setPreSampleList(response?.data?.data?.docs || []);
        }
        setCommunicationOption(null);
        //console.log("Response:", response?.data);
        setFormData({
          ...formData,
          numOfSamples: "",
          sealingDate: "",
        });
        setViewForm(false);
      })
      .catch((error) => {
        setIsLoading(false);
        //setDIData(null);
        Swal.fire({
          icon: "error",
          title: error?.response?.data?.message || "Something went wrong.",
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };

  const finalSubmit = () => {
    const data = {
      di: DIData?.di,
      numOfSamples: formData.numOfSamples,
      sealingDate: formData.sealingDate,
      communicateStoreCenterSampleDetails: communicationOption,
      additionalTestRequired: additionalTest ? "yes" : "no",
      frommultiplesample: 1,
    };

    axios
      .post(`${apiUrl}create-sample`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        Swal.fire({
          icon: "success",
          title: response?.data?.message,
        });
        setFormData({
          di: "",
          numOfSamples: "",
          sealingDate: "",
          sealDetails: "",
        });
        getSampleList(token);
        getSealList(token);
        setFinalSample(false);
      })
      .catch((error) => {
        setIsLoading(false);
        //setDIData(null);
        Swal.fire({
          icon: "error",
          title: error?.response?.data?.message || "Something went wrong.",
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  const deleteSample = (id) => {
    const data = {
      id: id,
    };
    axios
      .delete(`${apiUrl}delete-sample`, {
        data,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        Swal.fire({
          icon: "success",
          title: response?.data?.message,
        });
        getSampleList(token);
        getSealList(token);
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

  function getGrns(token) {
    const data = {
      materialID: DIData.di,
    };
    axios
      .post(`${apiUrl}list-grn-samples-not-selected`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        setMaterialData(response?.data?.data);
      })
      .catch((error) => {
        setIsLoading(false);
        setMaterialData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }

  function getGrn(id) {
    const data = {
      materialID: DIData.di,
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
        //console.log("Response:", response?.data);
        setMaterialData(response?.data?.data);
      })
      .catch((error) => {
        setIsLoading(false);
        setMaterialData(null);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  }

  function getSelectedGrns(token) {
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
        //console.log("Response:", response?.data);
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

  const [receivedItem, setReceivedItem] = useState([]);

  console.log("material---:", MaterialData);

  function selectedGrn(material = MaterialData[0]) {
    const id = material._id;
    console.log("selectedGrn id:", checkedItems);
    const exists = checkedItems.find((item) => item.id === id);
    if (exists) {
      setCheckedItems(checkedItems.filter((item) => item.id !== id));
      setReceivedItem(receivedItem.filter((item) => item.id !== id));
    } else {
      setCheckedItems([...checkedItems, { id: id }]);
      setReceivedItem([
        ...receivedItem,
        { id: id, receivedItem: material.receiveMaterailList },
      ]);
    }
  }
  //console.log("receivedItem:", receivedItem);
  const hasTransformerOrMeter = MaterialData?.some(
    (material) =>
      typeof material.associatedTags === "string" &&
      (material.associatedTags.toLowerCase().includes("transformer") ||
        material.associatedTags.toLowerCase().includes("meter"))
  );
  const isTransformer = MaterialData?.some(
    (material) =>
      typeof material.associatedTags === "string" &&
      material.associatedTags
        .toLowerCase()
        .includes("transformer" || "meter" || "vcb")
  );
  const isTransformer2 = selectedMaterialData?.some(
    (material) =>
      typeof material.associatedTags === "string" &&
      material.associatedTags
        .toLowerCase()
        .includes("transformer above 200 kva")
  );

  const requestUqc = () => {
    // Check if any selected material is a transformer above 200 kVA
    const hasTransformerAbove200 = MaterialData?.some(
      (material) =>
        checkedItems.some((item) => item.id === material._id) &&
        material.associatedTags
          ?.toLowerCase()
          .includes("transformer above 200 kva")
    );

    // Prepare the base payload
    const payload = {
      di: DIData.di,
      checkedItems: checkedItems.map((item) => ({ id: item.id })),
    };

    // Add transformer-specific fields if applicable
    if (hasTransformerAbove200) {
      // Validate transformer-specific fields
      if (
        !transformerInfo.suppliedQty ||
        !transformerInfo.remainingQty ||
        (transformerInfo.markedForTest && !transformerInfo.sampleNo)
      ) {
        Swal.fire({
          icon: "error",
          title: "Please fill all required transformer information fields",
        });
        return;
      }

      payload.suppliedQtyAgainstPOTillDate = Number(
        transformerInfo.suppliedQty
      );
      payload.remainingQtyToBeDelivered = Number(transformerInfo.remainingQty);
      payload.additionalTestRequired = transformerInfo.markedForTest
        ? "yes"
        : "no";

      if (transformerInfo.markedForTest) {
        payload.additionalTestName =
          "Lightening Impulse Voltage Withstand Test and Short Circuit Withstand (Thermal and Dynamic Ability) Test";
        payload.uniqueSampleNo = transformerInfo.sampleNo;
      }
    }

    axios
      .post(`${apiUrl}show-to-uqc`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        Swal.fire({
          icon: "success",
          title: "Request sent to UQC for sampling",
        });
        // Reset transformer info after successful submission
        setTransformerInfo({
          suppliedQty: "",
          remainingQty: "",
          markedForTest: false,
          sampleNo: "",
        });
      })
      .catch((error) => {
        setIsLoading(false);
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
        Swal.fire({
          icon: "error",
          title:
            error.response?.data?.message || "Failed to send request to UQC",
        });
      });
  };
  const handleTransformerInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTransformerInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const showSample = (id) => {
    const data = {
      sampleID: id,
    };
    axios
      .post(`${apiUrl}display-material-selected`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        Swal.fire({
          icon: "success",
          title: response?.data?.message || "Success",
        });
      })
      .catch((error) => {
        setIsLoading(false);
        setMaterialData(null);
        Swal.fire({
          icon: "error",
          title: error?.response?.data?.message || "Something went wrong",
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  const [sampleSelected, setSampleSelected] = useState([]);

  const selectSample = (sampleId, sealId) => {
    if (!sampleSelected.some((item) => item.itemID === sampleId)) {
      setSampleSelected((prev) => [
        ...prev,
        {
          sealId: sealId,
          itemID: sampleId,
        },
      ]);
    } else {
      setSampleSelected(
        sampleSelected.filter((sample) => sample.itemID !== sampleId)
      );
    }
  };
  const finalSelection = () => {
    const data = {
      finaldispathItems: sampleSelected,
    };
    axios
      .post(`${apiUrl}selected-for-dispatch`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        //console.log("Response:", response?.data);
        Swal.fire({
          icon: "success",
          title: response?.data?.message || "Success",
        });
      })
      .catch((error) => {
        setIsLoading(false);
        setMaterialData(null);
        Swal.fire({
          icon: "error",
          title: error?.response?.data?.message || "Something went wrong",
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.log(error);
      });
  };
  useEffect(() => {
    if (!showAdditionalTest) {
      setAdditionalTestSample("");
      setSelectedSample("");
      setAdditionalTest(false);
    }
  }, [showAdditionalTest]);
  useEffect(() => {
    if (!finalSample) {
      setManualList([]);
      setManualSample(false);
      setFormData({
        ...formData,
        numOfSamples: "",
        sealingDate: "",
      });
    }
  }, [finalSample]);
  const additionalTestSubmit = () => {
    if (!selectedSample?._id || !additionalTestSample) {
      Swal.fire({
        icon: "warning",
        title: "Missing required fields",
      });
      return;
    }

    setIsLoading(true); // Show loading before request

    const data = {
      di: DIData.di,
      additionalTestRequired: additionalTest ? "yes" : "no",
      sampleID: selectedSample._id,
      itemID: additionalTestSample,
    };

    axios
      .post(`${apiUrl}add-extra-test`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        setShowAdditionalTest(false);
        //console.log("Response:", response?.data);
        getSampleList(token);
        Swal.fire({
          icon: "success",
          title: response?.data?.message || "Success",
        });
      })
      .catch((error) => {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: error?.response?.data?.message || "Something went wrong",
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.error("API Error:", error);
      });
  };
  const addAdditionalTest = (required) => {
    setIsLoading(true); // Show loading before request

    const data = {
      di: extraTest?.di,
      additionalTestRequired: required,
      sampleID: extraTest?.sampleID,
      itemID: extraTest?.itemID,
    };

    axios
      .post(`${apiUrl}add-extra-test`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setIsLoading(false);
        setExtraTest(null);
        getSampleList(token);
        Swal.fire({
          icon: "success",
          title: response?.data?.message || "Success",
        });
      })
      .catch((error) => {
        setIsLoading(false);
        Swal.fire({
          icon: "error",
          title: error?.response?.data?.message || "Something went wrong",
        });
        if (error?.response?.data?.message === "error in token") {
          console.log("error in token");
        }
        console.error("API Error:", error);
      });
  };
  return (
    <form className="flex flex-col items-center justify-center w-full h-full space-y-4">
      <DIAutosuggestion sampleData={handleData} />
      {DIData && (
        <>
          {isLoading && <Loader />}
          {MaterialData && role !== "UPPCL_DIRD_UPPCL" && (
            <div>
              {MaterialData.length > 0 && <h3>New GRN</h3>}
              {MaterialData.length > 0
                ? MaterialData.map((material, index) => (
                    <div
                      className={`row mt-3 p-3 cursor-pointer ${
                        checkedItems.find((item) => item.id === material._id)
                          ? "activeBorder"
                          : "transparentBorder"
                      }`}
                      onClick={(e) => {
                        material?.sampleSelectedFromIt === 1
                          ? Swal.fire({
                              icon: "error",
                              title: "Sample already selected for Sealing.",
                            })
                          : selectedGrn(material);
                      }}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#F4F4F4" : "#ebe9e9",
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
                          {/* {material.receiveMaterailList.join(", ")} */}
                        </p>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          )}

          {MaterialData && MaterialData.length > 0 && (
            <div className="row m-0">
              <div className="mb-3">
                {role === "UPPCL_UQC_UPPCL" ||
                (role !== "UPPCL_UQC_UPPCL" && !hasTransformerOrMeter) ? (
                  <>
                    {MaterialData?.some(
                      (material) =>
                        checkedItems.some((item) => item.id === material._id) &&
                        material.associatedTags
                          ?.toLowerCase()
                          .includes("transformer above 200 kva")
                    ) && (
                      <div className="row mt-4 border p-3 rounded">
                        <div className="col-lg-12">
                          <h4>Transformer Above 200 kVA Information</h4>
                        </div>
                        <div className="col-lg-6">
                          <p>
                            <strong>Supplied Qty against PO till date:</strong>
                            {MaterialData[0]?.suppliedQtyAgainstPOTillDate}
                          </p>
                        </div>
                        <div className="col-lg-6">
                          <p>
                            <strong>
                              Remaining Quantity to be delivered in PO:
                            </strong>
                            {MaterialData[0]?.remainingQtyToBeDelivered}
                          </p>
                        </div>
                        <div className="col-lg-6">
                          <p>
                            <strong>
                              Is any transformer from this PO has already been
                              marked for:
                            </strong>{" "}
                            {MaterialData[0]?.uniqueSampleNo ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="col-lg-6">
                          <p>
                            <strong>Unique Sample No.</strong>
                            {MaterialData[0]?.uniqueSampleNo}
                          </p>
                        </div>
                      </div>
                    )}
                    <button
                      className="btn btn-primary float-end mt-3"
                      onClick={() => {
                        if (checkedItems.length === 0) {
                          Swal.fire({
                            icon: "error",
                            title: "Please select a GRN",
                          });
                          return;
                        } else {
                          setViewForm(true);
                          setFormData({
                            ...formData,
                            di: DIData.di,
                          });
                          //getTeam();
                        }
                      }}
                      type="button"
                    >
                      Add Sample
                    </button>
                  </>
                ) : (
                  hasTransformerOrMeter && (
                    <>
                      {MaterialData?.some(
                        (material) =>
                          checkedItems.some(
                            (item) => item.id === material._id
                          ) &&
                          material.associatedTags
                            ?.toLowerCase()
                            .includes("transformer above 200 kva")
                      ) && (
                        <div className="row mt-4 p-3 border rounded">
                          <h4>Transformer Above 200 kVA Information</h4>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Supplied Qty against PO till date
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              name="suppliedQty"
                              value={transformerInfo.suppliedQty}
                              onChange={handleTransformerInfoChange}
                              required
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Remaining Quantity to be delivered in PO
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              name="remainingQty"
                              value={transformerInfo.remainingQty}
                              onChange={handleTransformerInfoChange}
                              required
                            />
                          </div>

                          <div className="col-md-12 mb-3">
                            <label className="form-label">
                              Is any transformer from this PO has already been
                              marked for:
                              <ul>
                                <li>
                                  Lightening Impulse Voltage Withstand Test
                                </li>
                                <li>
                                  Short Circuit Withstand (Thermal and Dynamic
                                  Ability) Test
                                </li>
                              </ul>
                            </label>
                            <br />
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="markedForTest"
                                id="markedYes"
                                checked={transformerInfo.markedForTest === true}
                                onChange={() =>
                                  setTransformerInfo({
                                    ...transformerInfo,
                                    markedForTest: true,
                                  })
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor="markedYes"
                              >
                                Yes
                              </label>
                            </div>
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="markedForTest"
                                id="markedNo"
                                checked={
                                  transformerInfo.markedForTest === false
                                }
                                onChange={() =>
                                  setTransformerInfo({
                                    ...transformerInfo,
                                    markedForTest: false,
                                    sampleNo: "",
                                  })
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor="markedNo"
                              >
                                No
                              </label>
                            </div>
                          </div>

                          {transformerInfo.markedForTest && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                If Yes, Unique Sample No.
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                name="sampleNo"
                                value={transformerInfo.sampleNo}
                                onChange={handleTransformerInfoChange}
                                required={transformerInfo.markedForTest}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {role !== "UPPCL_DIRD_UPPCL" && (
                        <div className="row">
                          <div className="col-lg-12">
                            <button
                              className="btn btn-primary float-end mt-3"
                              type="button"
                              onClick={() => {
                                if (checkedItems.length === 0) {
                                  Swal.fire({
                                    icon: "error",
                                    title: "Please select a GRN",
                                  });
                                  return;
                                }
                                requestUqc();
                              }}
                            >
                              Request UQC for sampling
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )
                )}
              </div>
            </div>
          )}
          <>
            {selectedMaterialData && (
              <div>
                {selectedMaterialData.length > 0 && <h3>Selected GRN</h3>}
                {selectedMaterialData.length > 0
                  ? selectedMaterialData.map((material, index) => (
                      <div
                        className={`row mt-3 p-3 cursor-pointer ${
                          checkedItems.find((item) => item.id === material._id)
                            ? "activeBorder"
                            : "transparentBorder"
                        }`}
                        onClick={(e) => {
                          material?.sampleSelectedFromIt === 1
                            ? Swal.fire({
                                icon: "error",
                                title: "Sample already selected for Sealing.",
                              })
                            : selectedGrn(material);
                        }}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#F4F4F4" : "#ebe9e9",
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
                            {/* {material.receiveMaterailList.join(", ")} */}
                          </p>
                        </div>
                        {/* {MaterialData && MaterialData.length > 0 && (
                          <div className="col-lg-12">
                            <button
                              className="btn btn-primary float-end mt-3"
                              onClick={() => {
                                if (checkedItems.length === 0) {
                                  Swal.fire({
                                    icon: "error",
                                    title: "Please select a GRN",
                                  });
                                  return;
                                } else {
                                  setViewForm(true);
                                  getTeam();
                                }
                              }}
                              type="button"
                            >
                              Add Sample
                            </button>
                          </div>
                        )} */}
                      </div>
                    ))
                  : null}
              </div>
            )}

            {selectedMaterialData && selectedMaterialData.length > 0 && (
              <div className="row m-0">
                <div className="mb-3">
                  {role === "UPPCL_UQC_UPPCL" ||
                  (role !== "UPPCL_UQC_UPPCL" && !hasTransformerOrMeter) ? (
                    <>
                      {selectedMaterialData?.some(
                        (material) =>
                          checkedItems.some(
                            (item) => item.id === material._id
                          ) &&
                          material.associatedTags
                            ?.toLowerCase()
                            .includes("transformer above 200 kva")
                      ) && (
                        <div className="row mt-4 border p-3 rounded">
                          <div className="col-lg-12">
                            <h4>Transformer Above 200 kVA Information</h4>
                          </div>
                          <div className="col-lg-6">
                            <p>
                              <strong>
                                Supplied Qty against PO till date:
                              </strong>
                              {
                                selectedMaterialData[0]
                                  ?.suppliedQtyAgainstPOTillDate
                              }
                            </p>
                          </div>
                          <div className="col-lg-6">
                            <p>
                              <strong>
                                Remaining Quantity to be delivered in PO:
                              </strong>
                              {
                                selectedMaterialData[0]
                                  ?.remainingQtyToBeDelivered
                              }
                            </p>
                          </div>
                          <div className="col-lg-6">
                            <p>
                              <strong>
                                Is any transformer from this PO has already been
                                marked for:
                              </strong>{" "}
                              {selectedMaterialData[0]?.uniqueSampleNo
                                ? "Yes"
                                : "No"}
                            </p>
                          </div>
                          <div className="col-lg-6">
                            <p>
                              <strong>Unique Sample No.</strong>
                              {selectedMaterialData[0]?.uniqueSampleNo}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    hasTransformerOrMeter && (
                      <>
                        {selectedMaterialData?.some(
                          (material) =>
                            checkedItems.some(
                              (item) => item.id === material._id
                            ) &&
                            material.associatedTags
                              ?.toLowerCase()
                              .includes("transformer above 200 kva")
                        ) && (
                          <div className="row mt-4 p-3 border rounded">
                            <h4>Transformer Above 200 kVA Information</h4>

                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Supplied Qty against PO till date
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                name="suppliedQty"
                                value={transformerInfo.suppliedQty}
                                onChange={handleTransformerInfoChange}
                                required
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Remaining Quantity to be delivered in PO
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                name="remainingQty"
                                value={transformerInfo.remainingQty}
                                onChange={handleTransformerInfoChange}
                                required
                              />
                            </div>

                            <div className="col-md-12 mb-3">
                              <label className="form-label">
                                Is any transformer from this PO has already been
                                marked for:
                                <ul>
                                  <li>
                                    Lightening Impulse Voltage Withstand Test
                                  </li>
                                  <li>
                                    Short Circuit Withstand (Thermal and Dynamic
                                    Ability) Test
                                  </li>
                                </ul>
                              </label>
                              <br />
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="markedForTest"
                                  id="markedYes"
                                  checked={
                                    transformerInfo.markedForTest === true
                                  }
                                  onChange={() =>
                                    setTransformerInfo({
                                      ...transformerInfo,
                                      markedForTest: true,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="markedYes"
                                >
                                  Yes
                                </label>
                              </div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="markedForTest"
                                  id="markedNo"
                                  checked={
                                    transformerInfo.markedForTest === false
                                  }
                                  onChange={() =>
                                    setTransformerInfo({
                                      ...transformerInfo,
                                      markedForTest: false,
                                      sampleNo: "",
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="markedNo"
                                >
                                  No
                                </label>
                              </div>
                            </div>

                            {transformerInfo.markedForTest && (
                              <div className="col-md-6 mb-3">
                                <label className="form-label">
                                  If Yes, Unique Sample No.
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="sampleNo"
                                  value={transformerInfo.sampleNo}
                                  onChange={handleTransformerInfoChange}
                                  required={transformerInfo.markedForTest}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        {/* <div className="row">
                          <div className="col-lg-12">
                            <button
                              className="btn btn-primary float-end mt-3"
                              type="button"
                              onClick={() => {
                                if (checkedItems.length === 0) {
                                  Swal.fire({
                                    icon: "error",
                                    title: "Please select a GRN",
                                  });
                                  return;
                                }
                                requestUqc();
                              }}
                            >
                              Request UQC for sampling---
                            </button>
                          </div>
                        </div> */}
                      </>
                    )
                  )}
                </div>
              </div>
            )}
          </>
          <hr />
          {sampleList.length > 0 && (
            <div className="row mt-3">
              {sampleList.length > 0 && (
                <h4>
                  Sample Selected
                  {DIData?.totalQuantityReceived === 1 &&
                    DIData?.materialTag.includes("Transformer") &&
                    role === "UPPCL_DIRD_UPPCL" && (
                      <>
                        {sampleList.length > 1 && (
                          <button
                            className="btn btn-primary float-end ms-2"
                            type="button"
                            onClick={() => setFinalSample(true)}
                          >
                            Final Sample Selection
                          </button>
                        )}
                        <button
                          className="btn btn-primary float-end"
                          type="button"
                          onClick={() => {
                            if (extraTest === null) {
                              Swal.fire({
                                icon: "error",
                                title:
                                  "Please select a sample for additional test",
                              });
                              return;
                            } else {
                              Swal.fire({
                                icon: "warning",
                                title: "Are you sure?",
                                text: "You want to add additional test?",
                                showCancelButton: true,
                                confirmButtonText: "Yes",
                                cancelButtonText: "No",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  addAdditionalTest("yes");
                                } else {
                                  addAdditionalTest("no");
                                }
                              });
                            }
                          }}
                        >
                          Additional Test
                        </button>
                      </>
                    )}
                </h4>
              )}
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
                        <td>{sample?.items?.length}</td>
                        <td>{formatDate(sample?.sealingDate)}</td>
                        <td>
                          {sample.items.map((item) => (
                            <div key={item._id}>
                              <p>
                                <strong>Unique Sample No.</strong> {item.itemID}
                                , <strong>Line NO.</strong> {item.Line_NO},{" "}
                                <strong>GRN No.</strong> {item.grnNo},{" "}
                                <strong>Material Name</strong>{" "}
                                {item.materialName}, <strong>Location</strong>{" "}
                                {item.location}{" "}
                                {item?.testName && (
                                  <>
                                    <br />
                                    <strong>Additional Test</strong>{" "}
                                    {item.testName}
                                  </>
                                )}
                                <br />
                                {item.finalSample === 1 && (
                                  <>
                                    <span className="bg-dark text-white p-1 rounded">
                                      Final Sample
                                    </span>
                                    {DIData?.materialTag.includes(
                                      "Transformer"
                                    ) &&
                                      role === "UPPCL_DIRD_UPPCL" && (
                                        <input
                                          type="radio"
                                          onChange={() =>
                                            setExtraTest({
                                              di: sample.di,
                                              additionalTestRequired: "yes",
                                              sampleID: sample._id,
                                              itemID: item._id,
                                            })
                                          }
                                          value={item._id}
                                          checked={
                                            extraTest?.itemID === item._id
                                          }
                                          className="ms-4"
                                        />
                                      )}
                                  </>
                                )}
                              </p>
                            </div>
                          ))}
                        </td>

                        <td style={{ width: "160px" }}>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => {
                              Swal.fire({
                                title: "Are you sure?",
                                text: "You want to delete this sample?",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonText: "Yes",
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  deleteSample(sample._id);
                                }
                              });
                            }}
                          >
                            Delete
                          </button>
                          {/* {(DIData?.materialTag ===
                            "Transformer above 200 kVA" ||
                            DIData?.materialTag ===
                              "Transformer below 200 kVA") &&
                            sample.canDispatch === 1 &&
                            role === "UPPCL_DIRD_UPPCL" && (
                              <button
                                className="btn btn-primary btn-sm mt-2"
                                type="button"
                                onClick={() => {
                                  setShowAdditionalTest(true);
                                  setSelectedSample(sample);
                                }}
                              >
                                Additional Test
                              </button>
                            )} */}

                          {sample?.communicateStoreCenterSampleDetails === 0 &&
                            sample?.requestTocommunicate === 1 && (
                              <button
                                type="button"
                                onClick={() => showSample(sample._id)}
                                className="btn btn-primary mt-2 btn-sm"
                              >
                                Show Samples to store
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
              {totalPages > 1 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </div>
          )}

          <hr />
          {isTransformer &&
            (role === "UPPCL_UQC_UPPCL" || role === "UPPCL_DIRD_UPPCL") && (
              <div className="row mt-3">
                {preSampleList.length > 0 && <h4>Pre Samples</h4>}
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>DI</th>
                      <th>No. of Samples</th>
                      <th>Sealing done on</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preSampleList.length > 0 ? (
                      preSampleList.map((sample) => (
                        <tr key={sample._id}>
                          <td>{sample.di}</td>
                          <td>{sample?.noOfSamples}</td>
                          <td>{formatDate(sample?.sealingDate)}</td>

                          <td style={{ width: "160px" }}>
                            {role === "UPPCL_UQC_UPPCL" && (
                              <button
                                className="btn btn-danger btn-sm"
                                type="button"
                                onClick={() => {
                                  Swal.fire({
                                    title: "Are you sure?",
                                    text: "You want to delete this sample?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonText: "Yes",
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      preCreate("delete", sample._id);
                                    }
                                  });
                                }}
                              >
                                Delete
                              </button>
                            )}
                            {role === "UPPCL_DIRD_UPPCL" && (
                              <button
                                className="btn btn-primary btn-sm"
                                type="button"
                                onClick={() => {
                                  setSelectedSampleId(sample._id);
                                  setViewForm(true);
                                  selectedGrn();
                                }}
                              >
                                Create Sample
                              </button>
                            )}
                            {sample?.communicateStoreCenterSampleDetails ===
                              0 &&
                              sample?.requestTocommunicate === 1 && (
                                <button
                                  type="button"
                                  onClick={() => showSample(sample._id)}
                                  className="btn btn-primary btn-sm mt-2"
                                >
                                  Show Samples to Store
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

          {/* {sampleList.length > 0 && (
            <div className="row mt-3">
              {sampleList.length > 0 && <h4>Final Sample Selected </h4>}
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
                    sampleList.map(
                      (sample) =>
                        sample.canDispatch === 1 && (
                          <tr key={sample._id}>
                            <td>{sample.di}</td>
                            <td>{sample?.items?.length}</td>
                            <td>{formatDate(sample?.sealingDate)}</td>
                            <td>
                              {sample.items.map((item) => (
                                <div key={item._id}>
                                  <p>
                                    <strong>Unique Sample No.</strong>{" "}
                                    {item.itemID}, <strong>Line NO.</strong>{" "}
                                    {item.Line_NO}, <strong>GRN No.</strong>{" "}
                                    {item.grnNo}, <strong>Material Name</strong>{" "}
                                    {item.materialName},{" "}
                                    <strong>Location</strong> {item.location}
                                  </p>
                                </div>
                              ))}
                            </td>

                            <td style={{ width: "160px" }}>
                              <button
                                className="btn btn-danger btn-sm"
                                type="button"
                                onClick={() => {
                                  Swal.fire({
                                    title: "Are you sure?",
                                    text: "You want to delete this sample?",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonText: "Yes",
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      deleteSample(sample._id);
                                    }
                                  });
                                }}
                              >
                                Delete
                              </button>
                              {sample?.communicateStoreCenterSampleDetails ===
                                0 &&
                                sample?.requestTocommunicate === 1 && (
                                  <button
                                    type="button"
                                    onClick={() => showSample(sample._id)}
                                    className="btn btn-primary mt-2 btn-sm"
                                  >
                                    Show Samples to store
                                  </button>
                                )}
                            </td>
                          </tr>
                        )
                    )
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
          )} */}
          {/* {sealList.length > 0 && (
            <div className="row mt-3">
              {sealList.length > 0 &&
                (isTransformer || isTransformer2) &&
                DIData?.totalQuantityReceived === 1 && (
                  <>
                    <h4>
                      Final Sample Selection{" "}
                      <button
                        className="btn btn-primary float-end"
                        type="button"
                        onClick={() => finalSelection()}
                      >
                        Final Sample Selection
                      </button>
                    </h4>

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
                      {console.log("sealList", sealList)}
                      <tbody>
                        {sealList.length > 0 ? (
                          sealList.map((sample) => (
                            <tr key={sample._id}>
                              <td>{sample.di}</td>
                              <td>{sample?.samplesSelected?.length}</td>
                              <td>{formatDate(sample?.sealingDate)}</td>
                              <td>
                                {sample.samplesSelected.map((item) => (
                                  <div key={item._id}>
                                    <label>
                                      {(isTransformer || isTransformer2) &&
                                        DIData?.totalQuantityReceived === 1 && (
                                          <input
                                            type="checkbox"
                                            onChange={() =>
                                              selectSample(item._id, sample._id)
                                            }
                                          />
                                        )}
                                      <strong>Unique Sample No.</strong>{" "}
                                      {item.itemID}, <strong>Line NO.</strong>{" "}
                                      {item.Line_NO}, <strong>GRN No.</strong>{" "}
                                      {item.grnNo},{" "}
                                      <strong>Material Name</strong>{" "}
                                      {item.materialName},{" "}
                                      <strong>Location</strong> {item.location}
                                    </label>
                                  </div>
                                ))}
                              </td>

                              <td style={{ width: "160px" }}>
                                {sample?.communicateStoreCenterSampleDetails ===
                                  0 &&
                                  sample?.requestTocommunicate === 1 && (
                                    <button
                                      type="button"
                                      onClick={() => showSample(sample._id)}
                                      className="btn btn-primary mt-2 btn-sm"
                                    >
                                      Show Samples to store
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
          )} */}
        </>
      )}
      {viewForm && (
        <>
          <div className="custom-modal-overlay">
            <div className="modal-dialog-centered p-4">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ justifyContent: "space-between" }}
                >
                  <h5 className="">Sample Selection</h5>
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={() => setViewForm(false)}
                  ></button>
                </div>
                <div
                  className="modal-body"
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    maxHeight: "70vh",
                  }}
                >
                  {selectedSampleId === "" && (
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">No. of Samples</label>
                        <input
                          type="number"
                          name="numOfSamples"
                          className="form-control"
                          value={formData.numOfSamples}
                          onChange={handleChange}
                          placeholder="Enter No. of Samples"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Sealing to be done on date & time
                        </label>
                        <input
                          type="datetime-local"
                          name="sealingDate"
                          className="form-control"
                          value={formData.sealingDate}
                          onChange={handleChange}
                          min={new Date().toISOString().slice(0, 16)}
                          placeholder="Select Sealing Date"
                          required
                        />
                      </div>
                    </div>
                  )}
                  {/* <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">No. of Samples</label>
                      <input
                        type="number"
                        name="numOfSamples"
                        className="form-control"
                        value={formData.numOfSamples}
                        onChange={handleChange}
                        placeholder="Enter No. of Samples"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Sealing to be done on date & time
                      </label>
                      <input
                        type="datetime-local"
                        name="sealingDate"
                        className="form-control"
                        value={formData.sealingDate}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        placeholder="Select Sealing Date"
                        required
                      />
                    </div>
                  </div> */}
                  {(!isTransformer || selectedSampleId !== "") && (
                    <div className="row mx-0 mb-3">
                      <label className="form-label">
                        Manual Sample Selection
                      </label>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          checked={manualSample}
                          id="manualYes"
                          onChange={() => setManualSample(true)}
                        />
                        <label className="form-check-label" htmlFor="manualYes">
                          Yes
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="manualNo"
                          checked={!manualSample}
                          onChange={() => setManualSample(false)}
                        />
                        <label className="form-check-label" htmlFor="manualNo">
                          No
                        </label>
                      </div>
                      {console.log("---", manualSample, receivedItem)}
                      {manualSample &&
                        receivedItem.map((item) =>
                          item.receivedItem.map((rc) => {
                            const isChecked = manualList.some(
                              (i) =>
                                i.Serial_NO === rc.Serial_NO &&
                                i.grnNo === item.id
                            );
                            return (
                              <label
                                key={item.id + "" + rc._id}
                                className={`form-check-label p-2 border rounded mb-2 ${
                                  isChecked ? "bg-dark text-white" : "bg-light"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input me-2"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (
                                      manualList.length >=
                                        formData.numOfSamples &&
                                      !isChecked
                                    ) {
                                      Swal.fire({
                                        icon: "error",
                                        title: `You can select only ${formData.numOfSamples} samples`,
                                      });
                                      return;
                                    }
                                    if (e.target.checked) {
                                      setManualList((prev) => [
                                        ...prev,
                                        {
                                          grnNo: item.id,
                                          Serial_NO: rc.Serial_NO,
                                        },
                                      ]);
                                    } else {
                                      setManualList((prev) =>
                                        prev.filter(
                                          (i) =>
                                            !(
                                              i.Serial_NO === rc.Serial_NO &&
                                              i.grnNo === item.id
                                            )
                                        )
                                      );
                                    }
                                  }}
                                />
                                {rc.Serial_NO}
                              </label>
                            );
                          })
                        )}
                    </div>
                  )}

                  {isTransformer && (
                    <div className="row mb-3">
                      {role !== "UPPCL_DIRD_UPPCL" && (
                        <div className="col-md-12">
                          <label className="form-label">
                            Communication Option (for Transformers):
                          </label>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="communicationOption"
                              id="communicateBoth"
                              value={1}
                              checked={communicationOption === 1}
                              onChange={() => setCommunicationOption(1)}
                              required={isTransformer}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="communicateBoth"
                            >
                              Communicate Store Center and Sample Details
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="communicationOption"
                              id="communicateStoreOnly"
                              value={0}
                              checked={communicationOption === 0}
                              onChange={() => setCommunicationOption(0)}
                              required={isTransformer}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="communicateStoreOnly"
                            >
                              Communicate Store Center Details Only
                            </label>
                          </div>
                        </div>
                      )}
                      {/* <hr /> */}
                      {/* <div className="col-md-12 mb-3">
                        <label className="form-label">
                          Is any transformer from this PO has already been
                          marked for:
                          <ul>
                            <li>Lightening Impulse Voltage Withstand Test</li>
                            <li>
                              Short Circuit Withstand (Thermal and Dynamic
                              Ability) Test
                            </li>
                          </ul>
                        </label>
                        <br />
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="markedForTest"
                            id="markedYes"
                            checked={transformerInfo.markedForTest === true}
                            onChange={() =>
                              setTransformerInfo({
                                ...transformerInfo,
                                markedForTest: true,
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="markedYes"
                          >
                            Yes
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="markedForTest"
                            id="markedNo"
                            checked={transformerInfo.markedForTest === false}
                            onChange={() =>
                              setTransformerInfo({
                                ...transformerInfo,
                                markedForTest: false,
                                sampleNo: "",
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="markedNo"
                          >
                            No
                          </label>
                        </div>
                      </div> */}

                      {transformerInfo.markedForTest && (
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            If Yes, Unique Sample No.
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="sampleNo"
                            value={transformerInfo.sampleNo}
                            onChange={handleTransformerInfoChange}
                            required={transformerInfo.markedForTest}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="row mb-3">
                    <div className="col-md-12 my-3">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          selectedSampleId !== ""
                            ? handleSubmit()
                            : isTransformer
                            ? preCreate("add")
                            : handleSubmit()
                        }
                      >
                        Select Sample
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {finalSample && (
        <>
          <div className="custom-modal-overlay">
            <div className="modal-dialog-centered p-4">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ justifyContent: "space-between" }}
                >
                  <h5 className="">Final Sample Selection</h5>
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={() => setFinalSample(false)}
                  ></button>
                </div>
                <div
                  className="modal-body"
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    maxHeight: "70vh",
                  }}
                >
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">No. of Samples</label>
                      <input
                        type="number"
                        name="numOfSamples"
                        className="form-control"
                        value={formData.numOfSamples}
                        onChange={handleChange}
                        placeholder="Enter No. of Samples"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Sealing to be done on date & time
                      </label>
                      <input
                        type="datetime-local"
                        name="sealingDate"
                        className="form-control"
                        value={formData.sealingDate}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        placeholder="Select Sealing Date"
                        required
                      />
                    </div>
                  </div>

                  {DIData?.materialTag.includes("Transformer") && (
                    <div className="row mb-3">
                      <div className="col-md-12 mb-2">
                        <label className="form-label">
                          Communication Option (for Transformers):
                        </label>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="communicationOption"
                            id="communicateBoth"
                            value={1}
                            checked={communicationOption === 1}
                            onChange={() => setCommunicationOption(1)}
                            required={isTransformer}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="communicateBoth"
                          >
                            Communicate Store Center and Sample Details
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="communicationOption"
                            id="communicateStoreOnly"
                            value={0}
                            checked={communicationOption === 0}
                            onChange={() => setCommunicationOption(0)}
                            required={isTransformer}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="communicateStoreOnly"
                          >
                            Communicate Store Center Details Only
                          </label>
                        </div>
                      </div>

                      {transformerInfo.markedForTest && (
                        <div className="col-md-6 mb-3 mb-2">
                          <label className="form-label">
                            If Yes, Unique Sample No.
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="sampleNo"
                            value={transformerInfo.sampleNo}
                            onChange={handleTransformerInfoChange}
                            required={transformerInfo.markedForTest}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="row mb-3">
                    <div className="col-md-12 my-3">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => finalSubmit()}
                      >
                        Select Sample
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showAdditionalTest && (
        <>
          <div className="custom-modal-overlay">
            <div className="modal-dialog-centered p-4">
              <div className="modal-content">
                <div
                  className="modal-header"
                  style={{ justifyContent: "space-between" }}
                >
                  <h5 className="">Additional Test</h5>
                  <button
                    type="button"
                    className="btn-close float-end"
                    onClick={() => setShowAdditionalTest(false)}
                  ></button>
                </div>
                <div
                  className="modal-body"
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    maxHeight: "80vh",
                  }}
                >
                  {DIData?.materialTag.includes("Transformer") && (
                    <div className="row mb-3">
                      {role === "UPPCL_UQC_UPPCL" &&
                        selectedMaterialData[0]?.uniqueSampleNo ===
                          undefined && (
                          <>
                            <hr />
                            <div className="col-md-12">
                              <label className="form-label">
                                Do you also want to mark the selected sample for
                                Lightening Impulse Voltage Withstand Test and
                                Short Circuit Withstand (Thermal and Dynamic
                                Ability) Test
                              </label>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  id="additionalTestYes"
                                  value={"yes"}
                                  checked={additionalTest}
                                  onChange={() => setAdditionalTest(true)}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="additionalTestYes"
                                >
                                  Yes
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  id="additionalTestNo"
                                  value={"no"}
                                  checked={!additionalTest}
                                  onChange={() => setAdditionalTest(false)}
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="additionalTestNo"
                                >
                                  No
                                </label>
                              </div>
                            </div>
                            {additionalTest && (
                              <>
                                <hr />
                                <h4>
                                  Select Sample to Perform Additional Test
                                </h4>
                                <div className="col-md-12 mt-2">
                                  {selectedSample.items.map((item) => (
                                    <div
                                      className={`mb-1 rounded border p-1 cursor-pointer ${
                                        additionalTestSample === item._id
                                          ? "bg-dark text-white"
                                          : ""
                                      }`}
                                      key={item._id}
                                      onClick={() =>
                                        setAdditionalTestSample(item._id)
                                      }
                                    >
                                      <p>
                                        <strong>Unique Sample No.</strong>{" "}
                                        {item.itemID}, <strong>Line NO.</strong>{" "}
                                        {item.Line_NO}, <strong>GRN No.</strong>{" "}
                                        {item.grnNo},{" "}
                                        <strong>Material Name</strong>{" "}
                                        {item.materialName},{" "}
                                        <strong>Location</strong>{" "}
                                        {item.location}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        )}
                    </div>
                  )}
                  <div className="row mb-3">
                    <div className="col-md-12 my-3">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => additionalTestSubmit()}
                      >
                        Submit
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
};

export default SampleSelection;
