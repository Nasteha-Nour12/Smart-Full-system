import { useRef, useState } from "react";
import Button from "../ui/Button";
import { uploadSingleFileRequest } from "../../api/uploads.api";
import { getErrorMessage } from "../../utils/formatters";

const FileUploadField = ({
  label,
  value,
  accept,
  buttonLabel = "Upload File",
  onUploaded,
  onDelete,
  helperText,
}) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

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

  const openInBrowser = () => {
    if (!value) return;
    window.open(value, "_blank", "noopener,noreferrer");
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
              onClick={openInBrowser}
              className="mt-2 inline-block text-sm text-blue-600 underline"
            >
              View in browser
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
          <Button
            type="button"
            variant="danger"
            onClick={() => onDelete?.()}
            disabled={!value}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadField;
