import React, { ChangeEvent } from "react";

interface UploadPageProps {
  onUploadSuccess: (track: { url: string; title: string }) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onUploadSuccess }) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a temporary URL for the uploaded file.
      const trackUrl = URL.createObjectURL(file);
      const trackTitle = file.name;
      onUploadSuccess({ url: trackUrl, title: trackTitle });
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <h2>Upload Audio</h2>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
    </div>
  );
};

export default UploadPage;
