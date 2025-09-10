import React from "react";

const ChatButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        fontSize: "24px",
        cursor: "pointer"
      }}
    >
      💬
    </button>
  );
};

export default ChatButton;