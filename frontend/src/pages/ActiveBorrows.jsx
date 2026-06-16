// src/pages/ActiveBorrows.jsx
import { useGetActiveBorrowsQuery, useReturnItemMutation } from "../api/apiSlice";
import { useState, useMemo , useEffect  } from "react";
import { FaHandHoldingHeart, FaUndo, FaClock, FaExclamationTriangle, FaCode } from "react-icons/fa";

export default function ActiveBorrows() {
const { data: apiResponse, isLoading, error, refetch } = useGetActiveBorrowsQuery();
useEffect(() => {
  refetch();
}, []);
  const [returnItem] = useReturnItemMutation();

  const [returnModal, setReturnModal] = useState(null);
  const [returnNotes, setReturnNotes] = useState("");

  // Auto-detect array shapes and safely handle filtering
  const borrows = useMemo(() => {
    if (!apiResponse) return [];

    let rawList = [];

    // 1. Direct Array Check
    if (Array.isArray(apiResponse)) {
      rawList = apiResponse;
    } 
    // 2. Check standard object wrappers (nested or shallow)
    else {
      const core = apiResponse.data || apiResponse;
      rawList = Array.isArray(core) 
        ? core 
        : core.borrows || core.transactions || core.activeBorrows || core.items || [];
    }

    // 3. Last resort fallback: Find any key holding an array
    if (rawList.length === 0 && typeof apiResponse === "object") {
      const foundArray = Object.values(apiResponse).find(val => Array.isArray(val));
      if (foundArray) rawList = foundArray;
    }

    // Relaxed filtering: Only drop items clearly and explicitly marked as fully completed
    return rawList.filter(borrow => {
      if (!borrow) return false;
      
      const status = String(borrow.status || '').toLowerCase().trim();
      const isReturnedFlag = borrow.returned === true || borrow.isReturned === true || borrow.returned === "true";
      
      return status !== "returned" && status !== "completed" && !isReturnedFlag;
    });
  }, [apiResponse]);

  const openReturnModal = (borrow) => {
    setReturnModal(borrow);
    setReturnNotes("");
  };

  const handleReturn = async () => {
    if (!returnModal) return;

    const targetId = returnModal._id || returnModal.id;
    await returnItem({
      transactionId: targetId,
      notes: returnNotes.trim()
    });
    setReturnModal(null);
  };

  const isOverdue = (expectedDate) => {
    if (!expectedDate) return false;
    return new Date(expectedDate) < new Date();
  };

  const getDaysRemaining = (expectedDate) => {
    if (!expectedDate) return 0;
    const diffTime = new Date(expectedDate) - new Date();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(days) ? 0 : days;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse text-gray-500">
        Loading active borrows...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaHandHoldingHeart className="text-purple-600" /> Active Borrows
        </h1>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
          {borrows.length} {borrows.length === 1 ? 'item' : 'items'} rendered
        </div>
      </div>

      {/* Main Content Layout */}
      {borrows.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-16 text-center border border-dashed border-gray-300">
            <FaHandHoldingHeart className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No active borrowed items found match filtering rules</p>
          </div>

          {/* Live API Diagnostic Inspector Box */}
          {apiResponse && (
            <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-xs shadow-inner">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-3 border-b border-slate-700 pb-2">
                <FaCode /> LIVE API INSPECTOR DIAGNOSTIC
              </div>
              <p className="mb-2 text-slate-400">// This renders only if your server sent data but the app couldn't read its properties properly:</p>
              <pre className="overflow-auto max-h-60 p-2 bg-slate-950 rounded">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrows.map((borrow) => {
            const rowId = borrow._id || borrow.id;
            const daysRemaining = getDaysRemaining(borrow.expectedReturnDate);
            const overdue = isOverdue(borrow.expectedReturnDate);

            return (
              <div
                key={rowId}
                className={`bg-white rounded-xl shadow-md border-2 transition-all duration-200 hover:shadow-lg ${
                  overdue 
                    ? "border-red-400 ring-2 ring-red-100" 
                    : daysRemaining <= 2 
                    ? "border-orange-400 ring-2 ring-orange-100"
                    : "border-gray-200"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={borrow.item?.imageUrl || "https://placehold.co/80x80?text=Item"}
                      alt={borrow.item?.name || "Item"}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{borrow.item?.name || "Unknown Item"}</h3>
                      <p className="text-sm text-gray-600">
                        Qty: <span className="font-medium">{borrow.quantity} {borrow.item?.unit || ""}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Borrowed by:</span>
                      <span className="font-medium text-gray-900">{borrow.receiver || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Borrowed on:</span>
                      <span className="font-medium text-gray-900">
                        {borrow.createdAt ? new Date(borrow.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg mb-4 ${
                    overdue 
                      ? "bg-red-50 border border-red-200" 
                      : daysRemaining <= 2
                      ? "bg-orange-50 border border-orange-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      {overdue ? (
                        <FaExclamationTriangle className="text-red-600" />
                      ) : (
                        <FaClock className={daysRemaining <= 2 ? "text-orange-600" : "text-blue-600"} />
                      )}
                      <span className={`font-medium ${
                        overdue ? "text-red-700" : daysRemaining <= 2 ? "text-orange-700" : "text-blue-700"
                      }`}>
                        {overdue 
                          ? `OVERDUE by ${Math.abs(daysRemaining)} ${Math.abs(daysRemaining) === 1 ? 'day' : 'days'}`
                          : `Due in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`
                        }
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Expected return: {borrow.expectedReturnDate ? new Date(borrow.expectedReturnDate).toLocaleDateString() : "N/A"}
                    </div>
                  </div>

                  {borrow.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Notes:</p>
                      <p className="text-sm text-gray-700">{borrow.notes}</p>
                    </div>
                  )}

                  <button
                    onClick={() => openReturnModal(borrow)}
                    className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <FaUndo /> Mark as Returned
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Return</h3>
            
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Item:</span>
                <span className="font-medium">{returnModal.item?.name || "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{returnModal.quantity} {returnModal.item?.unit || ""}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Borrowed by:</span>
                <span className="font-medium">{returnModal.receiver || "N/A"}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Notes (Optional)
              </label>
              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Condition updates, description, etc..."
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReturn}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
              >
                Confirm Return
              </button>
              <button
                onClick={() => setReturnModal(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Notice */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
          <strong>Network Error:</strong> Unable to clear fetch cache correctly with server.
        </div>
      )}
    </div>
  );
}