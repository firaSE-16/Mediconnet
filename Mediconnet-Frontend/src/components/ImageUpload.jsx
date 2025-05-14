import { Trash2Icon } from "lucide-react";
import { useState, useEffect } from "react";

const ImageUpload = ({ onChange, value }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type and size
      if (!selectedFile.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      setError(null);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || isUploading) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mediconnet");  
    formData.append("cloud_name", "dwmae0ztq");  

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dwmae0ztq/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      console.log("🚀 ~ handleUpload ~ response:", response)

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log("🚀 ~ handleUpload ~ result:", result.secure_url)
      onChange(result.secure_url);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    onChange("");
  };

  return (
    <div>
      <div className="relative w-48 h-48 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Selected"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            >
              <Trash2Icon size={16} />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
            <span className="text-gray-400 text-4xl">+</span>
            <span className="text-gray-500 text-sm">Upload Image</span>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {file && !preview?.startsWith('http') && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className={`mt-4 ${isUploading ? 'bg-blue-400' : 'bg-blue-500'} text-white px-4 py-2 rounded-md`}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;