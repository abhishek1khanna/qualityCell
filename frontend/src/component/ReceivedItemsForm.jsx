import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ReceivedItem = ({ data, lineNo, receivedQuantity }) => {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "",
      quantity: "",
      lineNo: lineNo,
    },
  ]);

  const handleChange = (index, field, value) => {
    let updatedItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    // Check uniqueness of name
    if (field === "name") {
      const isDuplicate = updatedItems.some(
        (item, i) =>
          i !== index &&
          item.name.trim().toLowerCase() === value.trim().toLowerCase()
      );

      if (isDuplicate) {
        Swal.fire({
          icon: "warning",
          title: "Item name must be unique for this Line No.",
        });
        return;
      }
    }

    // Calculate total quantity
    let totalQuantity = updatedItems.reduce(
      (acc, item) => acc + Number(item.quantity || 0),
      0
    );

    // Ensure total quantity does not exceed received quantity
    if (totalQuantity <= receivedQuantity) {
      setItems(updatedItems);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Total Quantity cannot be greater than Received Quantity",
      });
    }
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { id: prev.length + 1, name: "", quantity: "", lineNo: lineNo },
    ]);
  };

  const removeRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (items.length > 0) {
      data(items);
    }
  }, [items]);

  return (
    <>
      {items.map((data, index) => (
        <div className="row mt-1" key={data.id}>
          <div className="col-lg-4">
            <input
              type="text"
              className="form-control"
              value={data.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
              placeholder="Identify particular no (unique)"
            />
          </div>
          <div className="col-lg-2">
            <input
              type="number"
              className="form-control"
              value={data.quantity}
              onChange={(e) => handleChange(index, "quantity", e.target.value)}
              placeholder="Enter Quantity"
            />
          </div>
          <div className="col-lg-2 d-flex">
            {items.length > 1 && (
              <button
                className="btn btn-danger me-2"
                type="button"
                onClick={() => removeRow(index)}
              >
                Remove
              </button>
            )}
            {index === items.length - 1 && (
              <button
                className="btn btn-primary"
                type="button"
                onClick={addRow}
              >
                Add
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default ReceivedItem;
