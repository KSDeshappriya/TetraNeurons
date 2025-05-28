import React, { useState } from 'react';
import { rejectEmergencyRequest } from '../../services/emergency';

interface RejectButtonProps {
  disasterId: string;
}

const RejectButton: React.FC<RejectButtonProps> = ({ disasterId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await rejectEmergencyRequest(disasterId);
      window.history.back();
    } catch (error) {
      console.error(error);
      alert('Failed to reject request.');
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-yellow-300 hover:bg-yellow-300 text-black font-semibold py-2 px-4 rounded"
      >
        Archive Request
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Action</h2>
            <p className="mb-4">Are you sure you want to archive this emergency request?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RejectButton;
