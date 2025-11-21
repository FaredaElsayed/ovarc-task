import Modal from "./Modal";

const ConfirmModal = ({
  show,
  title = "Confirm action",
  message = "Are you sure?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      show={show}
      title={title}
      save={onConfirm}
      cancel={onCancel}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
    >
      <p className="text-center text-gray-700">{message}</p>
    </Modal>
  );
};

export default ConfirmModal;

