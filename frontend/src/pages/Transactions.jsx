// src/pages/Transactions.jsx
import {
  useGetItemsQuery,
  useAddStockMutation,
  useIssueStockMutation,
  useBorrowStockMutation,
} from "../api/apiSlice";
import { useState } from "react";
import { FaPlus, FaMinus, FaHandHoldingHeart, FaSearch } from "react-icons/fa";

export default function Transactions() {
  const { data: items = [], isLoading: itemsLoading, isError } = useGetItemsQuery();

  const [addStock] = useAddStockMutation();
  const [issueStock] = useIssueStockMutation();
  const [borrowStock] = useBorrowStockMutation();

  const [addQty, setAddQty] = useState({});
  const [issueModal, setIssueModal] = useState(null);
  const [borrowModal, setBorrowModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [issueData, setIssueData] = useState({ quantity: "", receiver: "" });

  const [borrowData, setBorrowData] = useState({
    quantity: "",
    borrowerName: "",
    expectedReturnDate: "",
  });

  const handleAddStock = async (itemId) => {
    try {
      const qty = Number(addQty[itemId]);
      if (!qty || qty < 1) return alert("Quantity must be at least 1");

      await addStock({ id: itemId, quantity: qty }).unwrap();
      setAddQty({ ...addQty, [itemId]: "" });
    } catch (err) {
      alert(err?.data?.message || "Failed to add stock");
    }
  };

  // --- ISSUE LOGIC ---
  const openIssueModal = (item) => {
    setIssueModal({ itemId: item._id, name: item.name, unit: item.unit, available: item.quantity });
    setIssueData({ quantity: "", receiver: "" });
  };

  const handleIssueStock = async () => {
    try {
      const qty = Number(issueData.quantity);
      if (!qty || qty < 1) return alert("Quantity must be at least 1");
      if (!issueData.receiver.trim()) return alert("Receiver is required");

      await issueStock({
        id: issueModal.itemId,
        quantity: qty,
        receiver: issueData.receiver.trim(),
      }).unwrap();

      setIssueModal(null);
      setIssueData({ quantity: "", receiver: "" });
    } catch (err) {
      alert(err?.data?.message || "Failed to issue stock");
    }
  };

  // --- BORROW LOGIC ---
  const openBorrowModal = (item) => {
    setBorrowModal({ itemId: item._id, name: item.name, unit: item.unit, available: item.quantity });
    setBorrowData({ quantity: "", borrowerName: "", expectedReturnDate: "" });
  };

  const handleBorrowStock = async () => {
    try {
      const qty = Number(borrowData.quantity);
      if (!qty || qty < 1) return alert("Quantity must be at least 1");

      if (!borrowData.borrowerName.trim()) {
        return alert("Add the borrower name");
      }

      if (!borrowData.expectedReturnDate) return alert("Return date is required");

      // Controller only reads `borrower` (falls back to `receiver`) — send just that
      await borrowStock({
        id: borrowModal.itemId,
        quantity: qty,
        borrower: borrowData.borrowerName.trim(),
        expectedReturnDate: borrowData.expectedReturnDate,
      }).unwrap();

      setBorrowModal(null);
      setBorrowData({ quantity: "", borrowerName: "", expectedReturnDate: "" });
    } catch (err) {
      alert(err?.data?.message || "Failed to borrow stock");
    }
  };

  if (itemsLoading) return <p className="p-8 text-center animate-pulse text-gray-500">Loading items...</p>;
  if (isError) return <p className="p-8 text-center text-red-500">Failed to load items.</p>;

  // --- SEARCH FILTER ---
  const filteredItems = items.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Stock Transactions</h1>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search by item name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filteredItems.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-8">
            No items match "{searchQuery}"
          </p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item._id}
              className={`group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 ${
                item.quantity <= item.minQuantity ? "border-red-400 ring-2 ring-red-100" : ""
              }`}
            >
              <div className="p-4">
                <img
                  src={item.imageUrl || "https://placehold.co/150x150?text=No+Image"}
                  alt={item.name}
                  className="w-full h-36 object-cover rounded-md mb-3"
                />
                <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category?.name || "No Category"}</p>
                <p className="text-lg font-medium mt-2">
                  {item.quantity} <span className="text-sm text-gray-600">{item.unit}</span>
                </p>
                {item.borrowable && (
                  <p className="text-xs text-purple-600 mt-1 font-medium bg-purple-50 inline-block px-2 py-0.5 rounded">
                    Borrowable (Out: {item.borrowedQuantity})
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
                    onChange={(e) => setAddQty({ ...addQty, [item._id]: e.target.value })}
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => handleAddStock(item._id)}
                    disabled={!addQty[item._id]}
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                  >
                    <FaPlus /> Add
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openIssueModal(item)}
                    disabled={item.quantity < 1}
                    className="flex-1 min-w-0 px-2 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition flex justify-center items-center gap-1"
                  >
                    <FaMinus className="shrink-0" /> <span className="truncate">Issue</span>
                  </button>

                  <button
                    onClick={() => openBorrowModal(item)}
                    disabled={item.quantity < 1}
                    className="flex-1 min-w-0 px-2 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition flex justify-center items-center gap-1"
                  >
                    <FaHandHoldingHeart className="shrink-0" /> <span className="truncate">Borrow</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ISSUE MODAL */}
      {issueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Issue {issueModal.name}</h3>
            <p className="text-sm text-gray-600 mb-4">Available: {issueModal.available} {issueModal.unit}</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Issue</label>
                <input
                  type="number"
                  max={issueModal.available}
                  value={issueData.quantity}
                  onChange={(e) => setIssueData({ ...issueData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name/Department</label>
                <input
                  type="text"
                  value={issueData.receiver}
                  onChange={(e) => setIssueData({ ...issueData, receiver: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleIssueStock}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Confirm Issue
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

      {/* BORROW MODAL */}
      {borrowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border-t-4 border-purple-600">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaHandHoldingHeart className="text-purple-600" /> Borrow {borrowModal.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">Available: {borrowModal.available} {borrowModal.unit}</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Borrow</label>
                <input
                  type="number"
                  max={borrowModal.available}
                  value={borrowData.quantity}
                  onChange={(e) => setBorrowData({ ...borrowData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Name</label>
                <input
                  type="text"
                  placeholder="Enter borrower name"
                  value={borrowData.borrowerName}
                  onChange={(e) => setBorrowData({ ...borrowData, borrowerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={borrowData.expectedReturnDate}
                  onChange={(e) => setBorrowData({ ...borrowData, expectedReturnDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBorrowStock}
                className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
              >
                Confirm Borrow
              </button>
              <button
                onClick={() => setBorrowModal(null)}
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