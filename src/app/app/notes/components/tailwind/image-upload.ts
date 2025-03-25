import { createImageUpload } from "novel";
import { toast } from "sonner";
import { storage } from "@/database/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const onUpload = (file: File) => {
  return new Promise((resolve, reject) => {
    // Create a storage reference
    const storageRef = ref(storage, `note-images/${uuidv4()}-${file.name}`);
    
    toast.promise(
      // Upload to Firebase Storage
      uploadBytes(storageRef, file)
        .then((snapshot) => getDownloadURL(snapshot.ref))
        .then((url) => {
          // Preload the image
          const image = new Image();
          image.src = url;
          image.onload = () => {
            resolve(url);
          };
          return url;
        }),
      {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        error: (e) => {
          reject(e);
          return e.message || "Error uploading image";
        },
      }
    );
  });
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("File size too big (max 20MB).");
      return false;
    }
    return true;
  },
});