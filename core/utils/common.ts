import { CAMERA_CAPTURE_KEY } from "../constants/common-constants";


interface StoredFileData {
    name: string;
    type: string;
    dataURL: string;
}

export function saveFileToLocalStorage(file: File, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event: ProgressEvent<FileReader>) {
            if (event.target && typeof event.target.result === "string") {
                const fileData: StoredFileData = {
                    name: file.name,
                    type: file.type,
                    dataURL: event.target.result,
                };
                localStorage.setItem(key, JSON.stringify(fileData));
                resolve();
            } else {
                reject(new Error("FileReader produced no result"));
            }
        };
        reader.onerror = () =>
            reject(reader.error ?? new Error("FileReader failed"));
        reader.readAsDataURL(file);
    });
}

export function getFileFromLocalStorage(key: string): File | null {
    const item = localStorage.getItem(key);
    if (!item) {
        return null;
    }

    try {
        const fileData: StoredFileData = JSON.parse(item);
        // Convert data URL back to Blob
        const blob = dataURLtoBlob(fileData.dataURL);
        // Create a new File object with original filename and type
        return new File([blob], fileData.name, { type: fileData.type });
    } catch (error) {
        console.error('Error parsing stored file data:', error);
        return null;
    }
}


export function removeFileFromLocalStorage(key: string): void {
    localStorage.removeItem(key);
}

export function dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}

export function saveToLocalStorage(key: string, value: string) {
    if (window) {
        localStorage.setItem(key, value);
    }
}

export function getFromStorage(key: string) {
    if (window) {
        return localStorage.getItem(key);
    }

    return undefined;
}

export const capitalizeText = (text: string) => {
    let capitalizedText = text.charAt(0).toUpperCase() + text.slice(1)
    capitalizedText = capitalizedText.replace("_", " ")
    return capitalizedText
}




// sets image base64 as input image

export const setBase64AsInput = async (base64: string): Promise<void> => {
    const blob = dataURLtoBlob(base64);
    const file = new File([blob], "camera_capture", {
        lastModified: new Date().getTime(),
        type: blob.type,
    });

    await saveFileToLocalStorage(file, CAMERA_CAPTURE_KEY);
};
export async function imageUrlToBase64(url: string): Promise<string> {
    const response: Response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob: Blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to convert blob to base64"));
        reader.readAsDataURL(blob);
    });
}

