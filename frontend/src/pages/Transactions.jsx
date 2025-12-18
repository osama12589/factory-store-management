import {
  useGetItemsQuery,
  useAddStockMutation,
  useIssueStockMutation,
  useBorrowItemMutation,
} from "../api/apiSlice";
import { useState, useMemo } from "react";
import { FaPlus, FaMinus, FaHandHoldingHeart, FaPrint, FaSearch, FaTimes } from "react-icons/fa";
import PrintSlip from "../components/PrintSlip";

export default function Transactions() {
  const { data: items = [], isLoading: itemsLoading } = useGetItemsQuery();

  const [addStock] = useAddStockMutation();
  const [issueStock] = useIssueStockMutation();
  const [borrowItem] = useBorrowItemMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [addQty, setAddQty] = useState({});
  const [issueModal, setIssueModal] = useState(null);
  const [issueData, setIssueData] = useState({ quantity: "", receiver: "" });
  
  const [borrowModal, setBorrowModal] = useState(null);
  const [borrowData, setBorrowData] = useState({ 
    quantity: "", 
    receiver: "", 
    expectedReturnDate: "",
    notes: ""
  });

  const [successModal, setSuccessModal] = useState(null);
  const [printTransaction, setPrintTransaction] = useState(null);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const handleAddStock = async (itemId) => {
    const qty = addQty[itemId];
    if (!qty || qty <= 0) return;
    await addStock({ id: itemId, quantity: qty });
    setAddQty({ ...addQty, [itemId]: "" });
  };

  const openIssueModal = (item) => {
    setIssueModal({ itemId: item._id, name: item.name, unit: item.unit, maxQty: item.quantity, category: item.category.name });
    setIssueData({ quantity: "", receiver: "", notes: "" });
  };

  const handleIssueStock = async () => {
    if (!issueData.quantity || !issueData.receiver.trim()) return;
    
    try {
      const result = await issueStock({
        id: issueModal.itemId,
        quantity: Number(issueData.quantity),
        receiver: issueData.receiver.trim(),
      }).unwrap();

      setIssueModal(null);
      
      setSuccessModal({
        type: 'issue',
        item: issueModal.name,
        quantity: issueData.quantity,
        unit: issueModal.unit,
        transaction: result.transaction
      });
    } catch (error) {
      console.error('Issue failed:', error);
    }
  };

  const openBorrowModal = (item) => {
    const available = item.quantity - (item.borrowedQuantity || 0);
    setBorrowModal({ 
      itemId: item._id, 
      name: item.name, 
      unit: item.unit, 
      category: item.category.name,
      availableQty: available 
    });
    setBorrowData({ quantity: "", receiver: "", expectedReturnDate: "", notes: "" });
  };

  const handleBorrowItem = async () => {
    if (!borrowData.quantity || !borrowData.receiver.trim() || !borrowData.expectedReturnDate) return;
    
    try {
      const result = await borrowItem({
        id: borrowModal.itemId,
        quantity: Number(borrowData.quantity),
        receiver: borrowData.receiver.trim(),
        expectedReturnDate: borrowData.expectedReturnDate,
        notes: borrowData.notes
      }).unwrap();

      setBorrowModal(null);
      
      setSuccessModal({
        type: 'borrow',
        item: borrowModal.name,
        quantity: borrowData.quantity,
        unit: borrowModal.unit,
        transaction: result.transaction
      });
    } catch (error) {
      console.error('Borrow failed:', error);
    }
  };

  const openPrintSlip = () => {
    if (successModal && successModal.transaction) {
      setPrintTransaction({
        ...successModal.transaction,
        item: {
          name: successModal.item,
          unit: successModal.unit,
          category: successModal.transaction.item?.category || ''
        }
      });
      setSuccessModal(null);
    }
  };

  if (itemsLoading)
    return (
      <p className="p-8 text-center animate-pulse text-gray-500">
        Loading items...
      </p>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Stock Transactions</h1>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items to issue or borrow..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">
            {searchQuery ? "No items found matching your search." : "No items available."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredItems.map((item) => {
            const availableQty = item.quantity - (item.borrowedQuantity || 0);
            
            return (
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
                    src={item.imageUrl || "https://placehold.co/150x150?text=No+Image"}
                    alt={item.name}
                    className="w-full h-36 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">{item.category.name}</p>
                  
                  {item.borrowable ? (
                    <div className="mt-2">
                      <p className="text-sm">
                        Total: {item.quantity} {item.unit}
                      </p>
                      <p className="text-sm text-orange-600">
                        Borrowed: {item.borrowedQuantity || 0} {item.unit}
                      </p>
                      <p className="text-lg font-medium text-green-600">
                        Available: {availableQty} {item.unit}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-medium mt-2">
                      {item.quantity} <span className="text-sm text-gray-600">{item.unit}</span>
                    </p>
                  )}

                  {item.borrowable && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Borrowable
                    </span>
                  )}
                  
                  {item.quantity <= item.minQuantity && (
                    <p className="text-xs text-red-600 mt-1">Low Stock!</p>
                  )}
                </div>

                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={addQty[item._id] || ""}
                      onChange={(e) =>
                        setAddQty({ ...addQty, [item._id]: e.target.value })
                      }
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <button
                      onClick={() => handleAddStock(item._id)}
                      disabled={!addQty[item._id] || addQty[item._id] <= 0}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 whitespace-nowrap"
                    >
                      <FaPlus className="text-xs" /> Add
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {item.borrowable ? (
                      <button
                        onClick={() => openBorrowModal(item)}
                        disabled={availableQty === 0}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        <FaHandHoldingHeart /> Borrow
                      </button>
                    ) : (
                      <button
                        onClick={() => openIssueModal(item)}
                        disabled={item.quantity === 0}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        <FaMinus /> Issue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ISSUE MODAL */}
      {issueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Issue Stock: {issueModal.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={issueModal.maxQty}
                  value={issueData.quantity}
                  onChange={(e) =>
                    setIssueData({ ...issueData, quantity: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={`Max: ${issueModal.maxQty} ${issueModal.unit}`}
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
                    setIssueData({ ...issueData, receiver: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. Production Line A"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleIssueStock}
                disabled={!issueData.quantity || !issueData.receiver.trim()}
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

      {/* BORROW MODAL */}
      {borrowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Borrow Item: {borrowModal.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={borrowModal.availableQty}
                  value={borrowData.quantity}
                  onChange={(e) =>
                    setBorrowData({ ...borrowData, quantity: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Available: ${borrowModal.availableQty} ${borrowModal.unit}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Borrowed By (Person/Dept)
                </label>
                <input
                  type="text"
                  value={borrowData.receiver}
                  onChange={(e) =>
                    setBorrowData({ ...borrowData, receiver: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. John Doe, Maintenance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  value={borrowData.expectedReturnDate}
                  onChange={(e) =>
                    setBorrowData({ ...borrowData, expectedReturnDate: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={borrowData.notes}
                  onChange={(e) =>
                    setBorrowData({ ...borrowData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Purpose, location, etc."
                  rows="2"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBorrowItem}
                disabled={!borrowData.quantity || !borrowData.receiver.trim() || !borrowData.expectedReturnDate}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
              >
                Borrow Item
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

      {/* SUCCESS MODAL WITH PRINT OPTION */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {successModal.type === 'borrow' ? 'Item Borrowed Successfully!' : 'Stock Issued Successfully!'}
              </h3>
              <p className="text-gray-600">
                <span className="font-semibold">{successModal.quantity} {successModal.unit}</span> of{' '}
                <span className="font-semibold">{successModal.item}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={openPrintSlip}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FaPrint /> Print Slip
              </button>
              <button
                onClick={() => setSuccessModal(null)}
                className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT SLIP MODAL */}
      {printTransaction && (
        <PrintSlip
          transaction={printTransaction}
          onClose={() => setPrintTransaction(null)}
        />
      )}
    </div>
  );
}