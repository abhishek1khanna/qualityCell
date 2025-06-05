import { Link, useNavigate } from "react-router-dom";
import logo1 from "./../../assets/images/logo-1.png";
import { useEffect, useState } from "react";
import Layout from "../../component/layout";

function Register() {
  const navigate = useNavigate();
  const [credential, setCredential] = useState({
    userName: "",
    password: "",
    userType: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  /* useEffect(() => {
    if (localStorage.getItem("userData") !== null) {
      navigate("/dashboard", { replace: true });
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); */
  const login = () => {
    console.log("login");
  };
  return (
    <Layout>
      <div className="p-lg-5 p-4">
        <div>
          <h5 className="text-primary">Welcome to Quality Cell Management</h5>
          <p className="text-muted">Register to continue.</p>
        </div>
        <form onSubmit={login}>
          <div className="mt-4">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" placeholder="Enter Name" />
            </div>
            <div className="mb-3">
              <label className="form-label">Mobile</label>
              <input
                className="form-control"
                placeholder="Enter Mobile Number"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" placeholder="Enter Email" />
            </div>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                name="userType"
                onChange={(e) =>
                  setCredential((prevCredential) => ({
                    ...prevCredential,
                    userType: e.target.value,
                  }))
                }
              >
                <option value="">Select User Type</option>
                <option value="admin">Material Management</option>
                <option value="dispatcher">Store Unit</option>
                <option value="user">Quality Cell</option>
              </select>
            </div>
            <div className="mb-3">
              <div className="float-end"></div>
              <label className="form-label">Password</label>
              <div className="position-relative auth-pass-inputgroup mb-3">
                <input
                  type={viewPassword ? "text" : "password"}
                  className="form-control pe-5"
                  placeholder="Enter password"
                  value={credential.password}
                  onChange={(e) =>
                    setCredential((prevCredential) => ({
                      ...prevCredential,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <p>
                Already have account? <Link to={"/"}>Sign In</Link>
              </p>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                variant="contained"
                className={`btn w-100 ${
                  isLoading ? " btn-info" : " btn-success"
                }`}
                disabled={isLoading}
              >
                Register
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
export default Register;
