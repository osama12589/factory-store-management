import {
  useGetItemsQuery,
  useAddStockMutation,
  useIssueStockMutation,
} from "../api/apiSlice";
import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function Transactions() {
  const {
    data: items = [],
    isLoading: itemsLoading,
    isError,
  } = useGetItemsQuery();

  const [addStock] = useAddStockMutation();
  const [issueStock] = useIssueStockMutation();

  const [addQty, setAddQty] = useState({});
  const [issueModal, setIssueModal] = useState(null);
  const [issueData, setIssueData] = useState({
    quantity: "",
    receiver: "",
  });

  const handleAddStock = async (itemId) => {
    try {
      const qty = Number(addQty[itemId]);

      if (!qty || qty < 1) {
        alert("Quantity must be at least 1");
        return;
      }

      await addStock({
        id: itemId,
        quantity: qty,
      }).unwrap();

      setAddQty({
        ...addQty,
        [itemId]: "",
      });
    } catch (err) {
      alert(err?.data?.message || "Failed to add stock");
    }
  };

  const openIssueModal = (item) => {
    setIssueModal({
      itemId: item._id,
      name: item.name,
      unit: item.unit,
      available: item.quantity,
    });

    setIssueData({
      quantity: "",
      receiver: "",
    });
  };

  const handleIssueStock = async () => {
    try {
      const qty = Number(issueData.quantity);

      if (!qty || qty < 1) {
        alert("Quantity must be at least 1");
        return;
      }

      if (!issueData.receiver.trim()) {
        alert("Receiver is required");
        return;
      }

      await issueStock({
        id: issueModal.itemId,
        quantity: qty,
        receiver: issueData.receiver.trim(),
      }).unwrap();

      setIssueModal(null);

      setIssueData({
        quantity: "",
        receiver: "",
      });
    } catch (err) {
      alert(err?.data?.message || "Failed to issue stock");
    }
  };

  if (itemsLoading) {
    return (
      <p className="p-8 text-center animate-pulse text-gray-500">
        Loading items...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="p-8 text-center text-red-500">
        Failed to load items.
      </p>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Stock Transactions
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {items.map((item) => (
          <div
            key={item._id}
            className={`group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 ${
              item.quantity <= item.minQuantity
                ? "border-red-400 ring-2 ring-red-100"
                : ""
            }`}
          >
            <div className="p-4">
              <img
                src={
                  item.imageUrl ||
                  "https://placehold.co/150x150?text=No+Image"
                }
                alt={item.name}
                className="w-full h-36 object-cover rounded-md mb-3"
              />

              <h3 className="font-semibold text-gray-800 truncate">
                {item.name}
              </h3>

              <p className="text-sm text-gray-500">
                {item.category?.name || "No Category"}
              </p>

              <p className="text-lg font-medium mt-2">
                {item.quantity}{" "}
                <span className="text-sm text-gray-600">
                  {item.unit}
                </span>
              </p>

              {item.quantity <= item.minQuantity && (
                <p className="text-xs text-red-600 mt-1">
                  Low Stock!
                </p>
              )}
            </div>

            <div className="px-4 pb-4 space-y-3">
              {/* Add Stock */}
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={addQty[item._id] || ""}
                  onChange={(e) =>
                    setAddQty({
                      ...addQty,
                      [item._id]: e.target.value,
                    })
                  }
                  className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  onClick={() => handleAddStock(item._id)}
                  disabled={!addQty[item._id]}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 whitespace-nowrap"
                >
                  <FaPlus className="text-xs" />
                  Add
                </button>
              </div>

              {/* Issue Stock */}
              <button
                onClick={() => openIssueModal(item)}
                disabled={item.quantity === 0}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <FaMinus />
                Issue Stock
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Issue Modal */}
      {issueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Issue Stock: {issueModal.name}
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              Available: {issueModal.available} {issueModal.unit}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={issueData.quantity}
                  onChange={(e) =>
                    setIssueData({
                      ...issueData,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={`Max: ${issueModal.available} ${issueModal.unit}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issued To (Person/Dept)
                </label>

                <input
                  type="text"
                  value={issueData.receiver}
                  onChange={(e) =>
                    setIssueData({
                      ...issueData,
                      receiver: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. Production Line A"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleIssueStock}
                disabled={
                  !issueData.quantity ||
                  !issueData.receiver.trim()
                }
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                Issue Stock
              </button>

              <button
                onClick={() => setIssueModal(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
