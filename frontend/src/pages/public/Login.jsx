import { Link, useNavigate } from "react-router-dom";
import logo1 from "./../../assets/images/logo-1.png";
import { useEffect, useState } from "react";
import Layout from "../../component/layout";

function Login() {
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
      navigate("/add-material", { replace: true });
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); */
  const login = (e) => {
    e.preventDefault();
    navigate("/add-material");
  };
  return (
    <Layout>
      <div className="p-lg-5 p-4">
        <div>
          <h5 className="text-primary">Welcome to Quality Cell Management</h5>
          <p className="text-muted">Sign in to continue.</p>
        </div>
        <form onSubmit={login}>
          <div className="mt-4">
            <div className="mb-3">
              <label className="form-label">User Type</label>
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
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={credential.userName}
                onChange={(e) =>
                  setCredential((prevCredential) => ({
                    ...prevCredential,
                    userName: e.target.value,
                  }))
                }
                placeholder="Enter username"
              />
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
                Don't have account? <Link to={"/register"}>Register</Link>
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
                Sign In
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
export default Login;
