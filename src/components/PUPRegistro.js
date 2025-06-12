// src/components/PUPRegistro.js
import React, { useEffect } from 'react'; // Import useEffect
import '../assets/Popup.css'; // Make sure this path is correct

const PUPRegistro = ({ message, type, onClose }) => {
  // useEffect must be called unconditionally at the top level
  useEffect(() => {
    let timer;
    if (message) { // Conditionally set the timer only if a message exists
      timer = setTimeout(() => {
        onClose(); // Call onClose after 4 seconds
      }, 4000); // 4000 milliseconds = 4 seconds
    }

    // Cleanup function to clear the timer if the component unmounts
    // or if the message changes before the timer finishes
    return () => {
      clearTimeout(timer);
    };
  }, [message, onClose]); // Re-run effect if message or onClose changes

  // Conditional rendering for the component's JSX
  if (!message) {
    return null; // Don't render if there's no message
  }

  const popupClass = `popup-message ${type === 'error' ? 'error-message' : ''}`;

  return (
    <div className="modal-overlay">
      <div className="popup">
        <h3>Aviso</h3>
        <p className={popupClass}>{message}</p>
      </div>
    </div>
  );
};

export default PUPRegistro;