import React, { useRef } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  surface: string | undefined;
  primary: string | undefined;
  secondary: string | undefined;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, surface, primary, secondary }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={onClose}>
      <div className="bg-white/50">
        <div
          ref={dialogRef}
          className="p-6 rounded-md shadow-lg focus:outline-none max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: surface, color: primary, opacity: 1 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {title && <h2 id="dialog-title" className="text-lg font-semibold mb-6">{title}</h2>}
          <hr style={{ borderColor: secondary}}/>
          <div className="mb-6" />
          {children}

          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="font-bold py-2 px-4 underline"
              >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;