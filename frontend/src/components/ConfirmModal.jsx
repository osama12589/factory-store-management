// src/components/ConfirmModal.jsx
export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-fadeIn">
        <h2 className="text-xl font-bold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition shadow-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}