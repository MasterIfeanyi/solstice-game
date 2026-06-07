'use client'
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const Modal = ({ isShown, children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modal = (
    <div className="fixed w-full h-full inset-0 top-16 overflow-y-auto z-40 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {children}
    </div>
  );

  if (!mounted || !isShown) return null;

  return createPortal(modal, document.getElementById("modal-root"));
}

Modal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
}

export default Modal