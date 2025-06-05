import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Multiselect from "multiselect-react-dropdown";
import Loader from "../../component/Loader";
import { apiUrl } from "../../constant/constant";

function NotificationDetail() {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const storedNote = localStorage.getItem("notification");
    if (storedNote) {
      const data = JSON.parse(storedNote);
      console.log(data);
      setNotification(data);
    }
  }, [localStorage.getItem("notification")]);

  return (
    <>
      {notification && (
        <div className="row">
          <div className="col-md-12 mb-3">
            <label className="form-label">{notification.title}</label>
          </div>
          <div className="col-md-12 mb-3">
            <label className="form-label">{notification.description}</label>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationDetail;
