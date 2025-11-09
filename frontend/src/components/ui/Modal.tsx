import {createPortal} from 'react-dom';

export function Modal({children, onClose}) {
    return createPortal(
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative'>
                {children}
            </div>
        </div>,
        document.body,
    );
}
