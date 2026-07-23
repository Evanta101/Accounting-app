import React, { useState, useRef, useEffect } from 'react';

interface ConfirmPopoverProps {
  title: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  position?: 'top' | 'bottom';
}

export const ConfirmPopover: React.FC<ConfirmPopoverProps> = ({
  title,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  children,
  align = 'right',
  position = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      // Auto focus popover or confirm button for immediate keyboard navigation
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
    setIsOpen(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const alignClass =
    align === 'left' ? 'left-0' :
    align === 'center' ? 'left-1/2 -translate-x-1/2' :
    'right-0';

  const positionClass =
    position === 'bottom'
      ? 'top-full mt-2 origin-top'
      : 'bottom-full mb-2 origin-bottom';

  const pointerClass =
    position === 'bottom'
      ? 'bottom-full -mb-[5px] border-b-white border-t-transparent'
      : 'top-full -mt-[5px] border-t-white border-b-transparent';

  const pointerAlign =
    align === 'right' ? 'right-3' : align === 'left' ? 'left-3' : 'left-1/2 -translate-x-1/2';

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={toggleOpen} className="inline-block cursor-pointer">
        {children}
      </div>

      {isOpen && (
        <div
          className={`absolute ${positionClass} ${alignClass} z-50 w-60 max-w-[240px] bg-white rounded-[12px] p-3 border border-[#E5E5EA] shadow-[0_4px_16px_rgba(0,0,0,0.08)] animate-popover transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Triangular pointer */}
          <div className={`absolute ${pointerClass} ${pointerAlign} border-4 border-l-transparent border-r-transparent`} />

          <p className="text-xs font-medium text-[#1D1D1F] leading-snug mb-3">
            {title}
          </p>

          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-2.5 py-1 text-xs font-medium text-[#1D1D1F] bg-white hover:bg-[#F5F5F7] border border-[#D2D2D7] rounded-lg cursor-pointer transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#C1553D] focus-visible:ring-offset-2 outline-hidden"
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={handleConfirm}
              className={`px-3 py-1 text-xs font-medium text-white rounded-lg cursor-pointer transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-offset-2 outline-hidden ${
                confirmVariant === 'danger'
                  ? 'bg-[#D9552C] hover:bg-[#C24823] focus-visible:ring-[#D9552C]'
                  : 'bg-[#C1553D] hover:bg-[#A84732] focus-visible:ring-[#C1553D]'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
