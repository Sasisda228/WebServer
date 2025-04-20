import axios from "axios";
import React, { useRef } from "react";
import toast from "react-hot-toast";

interface MultiImageUploadProps {
  productId: number;
  onUploadSuccess: () => void;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  productId,
  onUploadSuccess,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });
    formData.append("productID", String(productId));

    try {
      const response = await axios.post("/api/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        toast.success("Images uploaded!");
        onUploadSuccess();
        if (inputRef.current) inputRef.current.value = "";
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading images");
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="file-input file-input-bordered file-input-lg w-full max-w-sm"
        onChange={handleFilesChange}
      />
    </div>
  );
};

export default MultiImageUpload;
