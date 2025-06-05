import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { dateFormat } from "../constant/constant";

function ListDownload({ data, grnNo, year }) {
  const [materialList, setMaterialList] = useState([]);

  useEffect(() => {
    if (data) {
      setMaterialList([
        ...(data?.receiveMaterailList || []),
        ...(data?.customReceivedMaterial ? [data.customReceivedMaterial] : []),
        ...(data?.Serial_NO_List ? [data.Serial_NO_List] : []),
      ]);
    }
  }, [data]);
  //console.log("Material List:-", materialList.flat());
  const exportToExcel = () => {
    if (!data) {
      Swal.fire("Error", "No data available for export.", "error");
      console.error("No data available for export.");
      return;
    }

    console.log("Exporting Data:", data);

    const date = data.GRN_Date?.toString() || "";
    const receiveDate =
      date.length === 8
        ? `${date.slice(6, 8)}-${date.slice(4, 6)}-${date.slice(0, 4)}`
        : dateFormat(data.createdAt);

    const dataObj = {
      DI: data.DI_No || data.di || "N/A",
      GRN_No: grnNo || data.grnNo || "N/A",
      Year: year || data.year || "N/A",
      Material_Name: data.Material_Description || data.materialName || "N/A",
      Line_No: data.DI_Line_Item || data.Line_NO || "N/A",
      Contract_No: data.Contract_No,
      Total_Quantity_Line_No: data.DI_Qty || data.totalQuantityLineNo || "N/A",
      Material_Code: data.Material_Code || data.materialCode || "N/A",
      Mat_Group: data.Material_Group || data.Mat_Group || "N/A",
      Plant_Name: data.Plant_Name || data.plantName || "N/A",
      Store_Location: data.Storage_location || data.storeLocation || "N/A",
      Received_Quantity: data.GRN_Qty || data.quantity || "N/A",
      Receive_Date: receiveDate || "N/A",
      Received_Material:
        materialList.length > 0
          ? materialList
              .flat()
              .map((item) =>
                item.name
                  ? `${item.name} (${item.quantity})`
                  : item.Serial_NO
                  ? `${item.Serial_NO}${
                      item.quantity ? ` (${item.quantity})` : ""
                    }`
                  : "N/A"
              )
              .join(", ")
          : "N/A",
    };
    //console.log(dataObj);
    //return;
    const worksheet = XLSX.utils.json_to_sheet([dataObj]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GRN Data");
    XLSX.writeFile(workbook, "GRN-Data.xlsx");
  };

  return (
    <>
      {materialList.length > 0 &&
        materialList
          .flat()
          .slice(0, 5)
          .map((item, index) => (
            <span key={item._id || index}>
              {item.name || item.Serial_NO}
              {item.quantity && `(${item.quantity})`},{" "}
            </span>
          ))}
      <button
        className="btn btn-sm btn-primary ms-2"
        type="button"
        onClick={exportToExcel}
      >
        Download GRN
      </button>
    </>
  );
}

export default ListDownload;
