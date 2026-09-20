import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import { ImageUploadError } from "../errors/upload/UploadErrors.js";

interface UploadImageProps {
    buffer: Buffer;
    name: string;
    folder: string;
}

// Sobe a imagem pro Cloudinary e devolve a URL segura. Qualquer falha do
// provedor vira ImageUploadError (502), sem vazar detalhe interno pro cliente.
export async function uploadImage({ buffer, name, folder }: UploadImageProps) {
    try {
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder,
                resource_type: "image",
                public_id: `${Date.now()}-${name.split(".")[0]}`
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });

            Readable.from(buffer).pipe(uploadStream);
        });

        return result.secure_url as string;
    } catch (error) {
        console.error(error);
        throw new ImageUploadError();
    }
}
