import React from 'react';

export default function PrintSlip({ transaction, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  if (!transaction) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSlipNumber = () => {
    const date = new Date(transaction.createdAt);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = date.getTime().toString().slice(-4);
    const type = transaction.type === 'BORROW' ? 'BOR' : 'ISS';
    return `${type}-${dateStr}-${timeStr}`;
  };

  const getTransactionTitle = () => {
    switch(transaction.type) {
      case 'BORROW': return 'BORROW SLIP';
      case 'RETURN': return 'RETURN SLIP';
      default: return 'ISSUE SLIP';
    }
  };

  return (
    <>
      {/* Modal Overlay - Hidden on Print */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
          {/* Preview Header */}
          <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Print Preview</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Slip Preview */}
          <div className="p-8 bg-gray-100 max-h-[70vh] overflow-y-auto">
            <div className="bg-white mx-auto" style={{ width: '400px' }}>
              <SlipContent transaction={transaction} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              🖨️ Print Slip
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Actual Print Content - Hidden on Screen */}
      <div className="hidden print:block">
        <SlipContent transaction={transaction} />
      </div>
    </>
  );
}

// Separate component for the actual slip content
function SlipContent({ transaction }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSlipNumber = () => {
    const date = new Date(transaction.createdAt);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = date.getTime().toString().slice(-4);
    const type = transaction.type === 'BORROW' ? 'BOR' : 'ISS';
    return `${type}-${dateStr}-${timeStr}`;
  };

  const getTransactionTitle = () => {
    switch(transaction.type) {
      case 'BORROW': return 'BORROW SLIP';
      case 'RETURN': return 'RETURN SLIP';
      default: return 'ISSUE SLIP';
    }
  };

  return (
    <div className="w-full bg-white text-black p-6 print:p-4" style={{ fontFamily: 'monospace' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-3 mb-3">
        <h1 className="text-xl font-bold">FACTORY STORE</h1>
        <h2 className="text-lg font-semibold mt-1">{getTransactionTitle()}</h2>
      </div>

      {/* Slip Info */}
      <div className="mb-3 text-sm">
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Date:</span>
          <span>{formatDate(transaction.createdAt)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Time:</span>
          <span>{formatTime(transaction.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Slip #:</span>
          <span className="font-mono font-bold">{getSlipNumber()}</span>
        </div>
      </div>

      {/* Item Details */}
      <div className="border-t-2 border-b-2 border-black py-3 my-3">
        <h3 className="font-bold text-sm mb-2 uppercase">Item Details</h3>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Item:</span>
            <span className="font-bold">{transaction.item.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Quantity:</span>
            <span className="font-bold text-lg">{transaction.quantity} {transaction.item.unit}</span>
          </div>
          {transaction.item.category && (
            <div className="flex justify-between">
              <span className="font-semibold">Category:</span>
              <span>{transaction.item.category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Issued To / Borrowed By */}
      <div className="mb-3">
        <h3 className="font-bold text-sm mb-2 uppercase">
          {transaction.type === 'BORROW' ? 'Borrowed By' : 'Issued To'}
        </h3>
        <div className="bg-gray-100 p-2 rounded">
          <p className="font-semibold text-base">{transaction.receiver || 'N/A'}</p>
        </div>
      </div>

      {/* Return Date for Borrows */}
      {transaction.type === 'BORROW' && transaction.expectedReturnDate && (
        <div className="mb-3 bg-yellow-50 border border-yellow-300 p-2 rounded">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Expected Return:</span>
            <span className="font-bold">{formatDate(transaction.expectedReturnDate)}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {transaction.notes && (
        <div className="mb-3">
          <h3 className="font-bold text-sm mb-1">Notes:</h3>
          <p className="text-xs bg-gray-50 p-2 rounded border">{transaction.notes}</p>
        </div>
      )}

      {/* Signature Section */}
      <div className="border-t-2 border-black pt-4 mt-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="mb-3 font-semibold">Issued By:</p>
            <div className="border-b border-black pb-1 mb-1"></div>
            <p className="text-center text-gray-600">Signature</p>
          </div>
          <div>
            <p className="mb-3 font-semibold">Received By:</p>
            <div className="border-b border-black pb-1 mb-1"></div>
            <p className="text-center text-gray-600">Signature</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-4 pt-3 border-t border-gray-300">
        <p>Please keep this slip for your records</p>
        <p className="mt-1">© 2025 Factory Store</p>
      </div>
    </div>
  );
}