import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmPopoverProps {
  title: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  position?: 'top' | 'bottom' | 'auto';
}

export const ConfirmPopover: React.FC<ConfirmPopoverProps> = ({
  title,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  children,
  align = 'right',
  position = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverTriggerRef = useRef<HTMLDivElement>(null);
  const popoverCardRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    actualPosition: 'top' | 'bottom';
  }>({ actualPosition: 'top' });

  const updatePosition = () => {
    if (!popoverTriggerRef.current) return;
    const rect = popoverTriggerRef.current.getBoundingClientRect();
    const popoverWidth = 240;

    // Determine vertical position: if top space is less than 180px, force 'bottom'
    let actualPos: 'top' | 'bottom' = 'top';
    if (position === 'bottom') {
      actualPos = 'bottom';
    } else if (position === 'top') {
      actualPos = rect.top < 180 ? 'bottom' : 'top';
    } else {
      // 'auto'
      actualPos = rect.top < 180 ? 'bottom' : 'top';
    }

    let topVal: number | undefined;
    let bottomVal: number | undefined;
    let leftVal: number | undefined;
    let rightVal: number | undefined;

    if (actualPos === 'bottom') {
      topVal = rect.bottom + 8;
    } else {
      bottomVal = window.innerHeight - rect.top + 8;
    }

    if (align === 'right') {
      rightVal = Math.max(12, window.innerWidth - rect.right);
    } else if (align === 'left') {
      leftVal = Math.max(12, rect.left);
    } else {
      leftVal = Math.max(12, rect.left + rect.width / 2 - popoverWidth / 2);
    }

    setCoords({
      top: topVal,
      bottom: bottomVal,
      left: leftVal,
      right: rightVal,
      actualPosition: actualPos,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverTriggerRef.current &&
        !popoverTriggerRef.current.contains(target) &&
        popoverCardRef.current &&
        !popoverCardRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      const handleScrollOrResize = () => {
        updatePosition();
      };

      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, position, align]);

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

  const pointerClass =
    coords.actualPosition === 'bottom'
      ? '-top-2 border-b-white border-t-transparent'
      : '-bottom-2 border-t-white border-b-transparent';

  const pointerAlign =
    align === 'right' ? 'right-4' : align === 'left' ? 'left-4' : 'left-1/2 -translate-x-1/2';

  return (
    <div className="relative inline-block" ref={popoverTriggerRef}>
      <div onClick={toggleOpen} className="inline-block cursor-pointer">
        {children}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverCardRef}
            style={{
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right: coords.right !== undefined ? `${coords.right}px` : undefined,
            }}
            className="fixed z-[9999] w-60 max-w-[240px] bg-white rounded-[12px] p-3 border border-[#E5E5EA] shadow-[0_8px_24px_rgba(0,0,0,0.12)] animate-popover transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Triangular pointer */}
            <div
              className={`absolute ${pointerClass} ${pointerAlign} border-4 border-solid border-l-transparent border-r-transparent`}
            />

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
          </div>,
          document.body
        )}
    </div>
  );
};

