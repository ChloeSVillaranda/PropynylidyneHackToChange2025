import { useState } from "react";
import DroneMap from "../components/DroneMap";
function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div>
        <DroneMap />
      </div>

      <section className="bg-white border-t border-gray-200 py-8 px-6 text-center">
        <h2 className="text-2xl font-bold mb-3 text-gray-800">Our Mission</h2>
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </section>

      <section className="bg-gray-100 border-t border-gray-200 py-8 px-6 text-center">
        <h2 className="text-2xl font-bold mb-3 text-gray-800">Our Drones</h2>
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed mb-5">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>

        <button
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: 500,
            padding: "0.5rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          See Drone Types
        </button>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Types of Drones
            </h3>

            <ul className="text-gray-700 text-left space-y-3">
              <li>
                <span className="font-semibold text-blue-600">Drones 1:</span>{" "}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </li>
              <li>
                <span className="font-semibold text-green-600">Drones 2:</span>{" "}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </li>
              <li>
                <span className="font-semibold text-orange-600">Drones 3:</span>{" "}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </li>
            </ul>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "#374151",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
