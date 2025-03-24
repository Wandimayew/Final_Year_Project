import { Camera } from "lucide-react";
import Image from "next/image";

const ImageUpload = ({ label, image, onChange }) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6">
        {image ? (
          <Image
            src={image}
            alt="Uploaded"
            className="h-32 w-32 rounded-lg object-cover"
          />
        ) : (
          <Camera className="h-12 w-12 text-gray-400" />
        )}
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => onChange(e.target.files[0])}
        />
      </label>
    </div>
  );
};

export default ImageUpload;
