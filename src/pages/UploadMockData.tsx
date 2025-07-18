import { useEffect } from "react";
import { uploadAllMockData } from "../utils/uploadMockData";

export default function UploadMockDataPage() {
  useEffect(() => {
    uploadAllMockData();
  }, []);
  return <div>Uploading mock data...</div>;
}
