export const apiUrl = "https://devops1.uppcl.org/qualitycell/api/";
export const dateFormat = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  //console.log(day);
  return `${day}-${month}-${year}`;
};
export const setDateFormat = (date) => {
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
export function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
export const diData = [
  {
    di: "DI101",
    materialName: "Copper Wire",
    quantity: 100,
    orderNo: "PO12345",
    firm: "ABC Metals",
    lab: "Metals Lab",
    tests: [
      { _id: "67663a6b68bd746cde97ec06" },
      { _id: "675fa84aff05410fc6d0c8f7" },
      { _id: "675fa4d55dbe4b0b4d9fb966" },
    ],
  },
  {
    di: "DI102",
    materialName: "Steel Rods",
    quantity: 200,
    orderNo: "PO12346",
    firm: "SteelWorks Ltd.",
    lab: "Strength Lab",
    tests: [
      { _id: "67663a6b68bd746cde97ec06" },
      { _id: "675fa84aff05410fc6d0c8f7" },
    ],
  },
  {
    di: "DI103",
    materialName: "Aluminum Sheets",
    quantity: 150,
    orderNo: "PO12347",
    firm: "AluTech",
    lab: "Metals Lab",
    tests: [{ _id: "675fa4d55dbe4b0b4d9fb966" }],
  },
  {
    di: "DI104",
    materialName: "Plastic Pipes",
    quantity: 300,
    orderNo: "PO12348",
    firm: "PlastiCo",
    lab: "Polymer Lab",
    tests: [
      { _id: "67663a6b68bd746cde97ec06" },
      { _id: "675fa84aff05410fc6d0c8f7" },
    ],
  },
  {
    di: "DI105",
    materialName: "Rubber Seals",
    quantity: 250,
    orderNo: "PO12349",
    firm: "SealMaster",
    lab: "Polymer Lab",
    tests: [{ _id: "675fa4d55dbe4b0b4d9fb966" }],
  },
  {
    di: "DI106",
    materialName: "Ceramic Tiles",
    quantity: 500,
    orderNo: "PO12350",
    firm: "CeramicsPlus",
    lab: "Quality Lab",
    tests: [
      { _id: "67663a6b68bd746cde97ec06" },
      { _id: "675fa84aff05410fc6d0c8f7" },
      { _id: "675fa4d55dbe4b0b4d9fb966" },
    ],
  },
  {
    di: "DI107",
    materialName: "Glass Panels",
    quantity: 400,
    orderNo: "PO12351",
    firm: "ClearView Glass",
    lab: "Glass Lab",
    tests: [{ _id: "67663a6b68bd746cde97ec06" }],
  },
  {
    di: "DI108",
    materialName: "Insulation Foam",
    quantity: 600,
    orderNo: "PO12352",
    firm: "InsulWorks",
    lab: "Thermal Lab",
    tests: [{ _id: "675fa4d55dbe4b0b4d9fb966" }],
  },
  {
    di: "DI109",
    materialName: "Concrete Mix",
    quantity: 800,
    orderNo: "PO12353",
    firm: "ConcretePro",
    lab: "Strength Lab",
    tests: [
      { _id: "675fa84aff05410fc6d0c8f7" },
      { _id: "675fa4d55dbe4b0b4d9fb966" },
    ],
  },
  {
    di: "DI110",
    materialName: "Wood Panels",
    quantity: 350,
    orderNo: "PO12354",
    firm: "TimberTech",
    lab: "Wood Lab",
    tests: [
      { _id: "67663a6b68bd746cde97ec06" },
      { _id: "675fa84aff05410fc6d0c8f7" },
    ],
  },
];
