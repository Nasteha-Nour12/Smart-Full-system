import { useRef, useState } from "react";
import Button from "../ui/Button";
import { uploadSingleFileRequest } from "../../api/uploads.api";
import { getErrorMessage } from "../../utils/formatters";
import Modal from "../ui/Modal";

const FileUploadField = ({
  label,
  value,
  accept,
  buttonLabel = "Upload File",
  onUploaded,
  helperText,
}) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  const normalizedUrl = String(value || "").trim();
  const lowerUrl = normalizedUrl.toLowerCase();
  const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((ext) =>
    lowerUrl.includes(ext)
  );
  const isPdf = lowerUrl.includes(".pdf");
  const previewUrl = isPdf || isImage
    ? normalizedUrl
    : `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(normalizedUrl)}`;

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadSingleFileRequest(file);
      onUploaded?.(res.data?.url || "");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to upload file"));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          {helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
          {value ? (
            <button
              type="button"
              className="mt-2 inline-block text-left text-sm text-blue-600 underline"
              onClick={() => setOpenPreview(true)}
            >
              View uploaded file
            </button>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No file uploaded yet</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            loading={uploading}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
      <Modal open={openPreview} onClose={() => setOpenPreview(false)} title={`${label} Preview`} footer={null} size="full">
        {normalizedUrl ? (
          <div className="h-[75vh] overflow-hidden rounded-lg border border-slate-200 bg-white">
            {isImage ? (
              <div className="flex h-full items-center justify-center bg-slate-50 p-4">
                <img src={normalizedUrl} alt={`${label} preview`} className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <iframe
                src={previewUrl}
                title={`${label} preview`}
                className="h-full w-full"
              />
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default FileUploadField;
