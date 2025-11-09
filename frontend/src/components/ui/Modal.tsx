import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
}) => {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative'>
                {title && (
                    <h2 className='text-xl font-semibold mb-4'>{title}</h2>
                )}
                <div className='mb-4'>{children}</div>
                <button
                    onClick={onClose}
                    className='absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold'>
                    ✕
                </button>
            </div>
        </div>
    );
};
