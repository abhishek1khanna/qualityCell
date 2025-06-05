import { Link } from "react-router-dom";
import logo1 from "./../assets/images/logo-1.png";

function LeftPanel() {
  return (
    <div className="col-lg-6">
      <div className="p-lg-5 p-4 auth-one-bg h-100">
        <div className="bg-overlay"></div>
        <div className="position-relative h-100 d-flex flex-column">
          <div className="mb-4">
            <Link to={"/"} className="d-block text-center">
              <img src={logo1} alt="" height="100%" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LeftPanel;
