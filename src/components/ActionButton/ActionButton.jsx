import React from "react";

const ActionButton = ({ icon, action, disabled = false, title }) => {
  const handleClick = () => {
    if (disabled) return;
    action?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={title}
      className={`grid place-items-center w-10 h-10 rounded ${
        disabled
          ? "bg-gray-500 cursor-not-allowed opacity-60"
          : "bg-main hover:bg-main/90 cursor-pointer"
      }`}
    >
      <img src={icon} alt="Action" className="w-4 h-4" />
    </button>
  );
};

export default ActionButton;
