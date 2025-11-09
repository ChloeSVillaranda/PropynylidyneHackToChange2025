import {useState} from 'react';
import DroneMap from '../components/DroneMap';
import {Button} from '../components/ui/Button';
import {Modal} from '../components/ui/Modal';

function Dashboard() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div>
                <DroneMap />
            </div>

            <section className='bg-white border-t border-gray-200 py-8 px-6 text-center'>
                <h2 className='text-2xl font-bold mb-3 text-gray-800'>
                    Our Mission
                </h2>
                <p className='text-gray-600 max-w-3xl mx-auto leading-relaxed'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </p>
            </section>

            <section className='bg-gray-100 border-t border-gray-200 py-8 px-6 text-center'>
                <h2 className='text-2xl font-bold mb-3 text-gray-800'>
                    Our Drones
                </h2>
                <p className='text-gray-600 max-w-3xl mx-auto leading-relaxed mb-5'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>

                <Button
                    onClick={() => setShowModal(true)}
                    className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg'>
                    See Drone Types
                </Button>
            </section>

            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <h3 className='text-xl font-semibold mb-4 text-gray-800'>
                        Types of Drones
                    </h3>

                    <ul className='text-gray-700 text-left space-y-3'>
                        <li>
                            <span className='font-semibold text-blue-600'>
                                Drone 1:
                            </span>{' '}
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua. Ut enim ad minim veniam, quis
                            nostrud exercitation ullamco laboris nisi ut aliquip
                            ex ea commodo consequat.
                        </li>
                        <li>
                            <span className='font-semibold text-green-600'>
                                Drone 2:
                            </span>{' '}
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua. Ut enim ad minim veniam, quis
                            nostrud exercitation ullamco laboris nisi ut aliquip
                            ex ea commodo consequat.
                        </li>
                        <li>
                            <span className='font-semibold text-orange-600'>
                                Drone 3:
                            </span>{' '}
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua. Ut enim ad minim veniam, quis
                            nostrud exercitation ullamco laboris nisi ut aliquip
                            ex ea commodo consequat.
                        </li>
                    </ul>

                    <div className='mt-6 text-right'>
                        <button
                            onClick={() => setShowModal(false)}
                            className='bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg'>
                            Close
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}

export default Dashboard;
