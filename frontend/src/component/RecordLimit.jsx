import { useUserContext } from "../utils/userContext";

function RecordLimit() {
  const { setLimit, limit } = useUserContext();
  return (
    <div className="row">
      <label className="col-lg-8 text-end pt-2">Show Records</label>
      <div className=" col-lg-4">
        <select
          className="form-control"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        >
          <option value={"1"}>1</option>
          <option value={"2"}>2</option>
          <option value={"3"}>3</option>
          <option value={"4"}>4</option>
        </select>
      </div>
    </div>
  );
}
export default RecordLimit;
