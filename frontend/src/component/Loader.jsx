import ThreeDotsWave from "./ThreeDotsWave";
function Loader() {
  return (
    <div
      className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100"
      style={{ zIndex: 1050, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      {/* <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Loading...</span>
      </div> */}
      <ThreeDotsWave />
    </div>
  );
}
export default Loader;
