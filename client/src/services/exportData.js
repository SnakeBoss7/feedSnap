import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export const exportData = async ( formatType ) => {
    console.log(formatType)
  const response = await axios.get(
    `${apiUrl}/api/feedback/export?format=${formatType}`,
    {
      withCredentials: true,
      responseType: "blob", 
    }
  );

  const blob = new Blob([response.data], {
    type:
      formatType === "pdf"
        ? "application/pdf"
        : "text/csv;charset=utf-8;", // adjust for CSV
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `feedbacks.${formatType}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
