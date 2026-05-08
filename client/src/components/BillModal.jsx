const BillModal = ({ record, onClose }) => {
  if (!record) return null;

  // billImage is a full storage URL.
  const billUrl = record.billImage || null;

  const isPDF = billUrl?.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-highest bg-surface-low">
          <div>
            <h3 className="font-semibold text-primary">Bill / Receipt</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {record.busNumber} · {record.workType} · {new Date(record.date).toLocaleDateString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          {billUrl ? (
            isPDF ? (
              <div className="p-4 space-y-3">
                <iframe src={billUrl} className="w-full rounded-lg border border-surface-highest" style={{ height: '65vh' }} title="Bill PDF" />
                <a href={billUrl} target="_blank" rel="noreferrer" className="btn-outline inline-flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Open PDF
                </a>
              </div>
            ) : (
              <img
                src={billUrl}
                alt="Bill"
                className="w-full object-contain max-h-[65vh]"
                onError={(e) => { e.target.src = ''; e.target.alt = 'Image not available'; }}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-3">image_not_supported</span>
              <p>No bill image available</p>
            </div>
          )}
        </div>

        {/* Footer with record details */}
        <div className="px-6 py-3 bg-surface-low border-t border-surface-highest">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Vendor: <strong>{record.vendorName}</strong></span>
            <span>Amount: <strong className="text-primary">₹{Number(record.amount || 0).toLocaleString('en-IN')}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
