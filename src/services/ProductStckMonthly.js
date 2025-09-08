import axios from "axios";

const fetchMonthlySales = async () => {
  const response = await axios.get("http://localhost:5000/api/pos/monthly-product", {
    params: {
      unit_cd: "001",
      company_cd: "001",
      branch_cd: "001",
      month: "08",
      year: "2025",
    },
  });
  setData(response.data); // asumsi `data` digunakan oleh <ProductSalesTable data={data} />
};
