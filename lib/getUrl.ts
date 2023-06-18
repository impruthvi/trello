import { storage } from "@/appwrite";

const getUrl = async (image: Image) => {
  const imageObject: Image = JSON.parse(image.toString());
  const url = storage.getFilePreview(imageObject.bucketId, imageObject.fileId);

  return url;
};

export default getUrl;
