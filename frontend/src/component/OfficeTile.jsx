export default function OfficeTile({ area }) {
  //console.log(area);
  const { office, role } = area;

  return (
    <div className="p-3 my-2 bg-white rounded shadow transition-shadow hover:shadow-lg">
      {/* The name of the office */}
      <div className="fw-semibold" style={{ color: "#1f2937" }}>
        {office.name} <p className="mb-0">({role?.role})</p>
      </div>

      {/* The type of the office */}
      {/* <div className="text-sm text-gray-600">{office.type}</div> */}
    </div>
  );
}
