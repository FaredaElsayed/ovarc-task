import React from "react";
import ActionButton from "../ActionButton/ActionButton";
import pencil from "../../assets/Pencil.png";
import trash from "../../assets/Bin.png";

const TableActions = ({ row, onEdit, onDelete, disabled = false }) => {
  if (disabled) {
    return (
      <span className="text-xs text-gray-400">
        Sign in to be able to manage
      </span>
    );
  }

  return (
    <div className="flex space-x-2">
      <ActionButton icon={pencil} action={() => onEdit?.(row)} />
      <ActionButton icon={trash} action={onDelete} />
    </div>
  );
};
export default TableActions;
