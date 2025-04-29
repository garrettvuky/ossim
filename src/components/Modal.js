import React, { useState, useEffect } from "react";
import Button from "./Button";

/**
 * Modal component for renaming or moving items.
 * 
 * @param {string} title Modal title
 * @param {string} placeholder Placeholder text for input field
 * @param {boolean} isOpen Controls whether the modal is visible
 * @param {function} onClose Callback to close the modal
 * @param {function} onSubmit Callback when submitting input value
 */
export default function Modal({ title, placeholder, isOpen, onClose, onSubmit }) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isOpen) setInputValue("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded p-2 mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            onSubmit(inputValue);
            onClose();
          }}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
