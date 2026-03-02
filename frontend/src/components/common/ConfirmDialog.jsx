// src/components/common/ConfirmDialog.jsx
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const ConfirmDialog = ({
  open,
  title = "Confirm Action",
  message = "Are you sure?",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600 mb-6">
        {message}
      </p>

      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={onConfirm}
          loading={loading}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
