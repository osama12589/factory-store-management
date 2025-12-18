import { useGetItemsQuery, useCreateItemMutation, useUpdateItemMutation, useDeleteItemMutation, useGetCategoriesQuery } from "../api/apiSlice";
import { useState, useMemo } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaSearch } from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";

export default function Items() {
  const { data: items = [], isLoading, isError } = useGetItemsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();
  const [deleteItem] = useDeleteItemMutation();

  const [searchQuery, setSearchQuery] = useState("");

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: "",
    minQuantity: "",
    unit: "pcs",
    borrowable: false,
    image: null,
  });

  const [editingId, setEditingId] = useState(null);
  const [editingItem, setEditingItem] = useState({});

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
  });

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const handleCreate = async () => {
    if (!newItem.name || !newItem.category) return;

    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("category", newItem.category);
    formData.append("quantity", newItem.quantity || 0);
    formData.append("minQuantity", newItem.minQuantity || 0);
    formData.append("unit", newItem.unit);
    formData.append("borrowable", newItem.borrowable);
    if (newItem.image) formData.append("image", newItem.image);

    await createItem(formData).unwrap();
    setNewItem({ name: "", category: "", quantity: "", minQuantity: "", unit: "pcs", borrowable: false, image: null });
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditingItem({
      name: item.name,
      category: item.category._id,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      borrowable: item.borrowable,
      image: null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingItem({});
  };

  const saveEdit = async (id) => {
    const formData = new FormData();
    formData.append("name", editingItem.name);
    formData.append("category", editingItem.category);
    formData.append("quantity", editingItem.quantity);
    formData.append("minQuantity", editingItem.minQuantity);
    formData.append("unit", editingItem.unit);
    formData.append("borrowable", editingItem.borrowable);
    if (editingItem.image) formData.append("image", editingItem.image);

    await updateItem({ id, formData }).unwrap();
    cancelEdit();
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({ open: true, id, name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, id: null, name: "" });
  };

  const confirmDelete = async () => {
    if (deleteModal.id) {
      await deleteItem(deleteModal.id).unwrap();
    }
    closeDeleteModal();
  };

  if (isLoading) return <p className="p-8 text-center animate-pulse text-gray-500">Loading items...</p>;
  if (isError) return <p className="p-8 text-center text-red-500">Failed to load items.</p>;

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Items</h1>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items by name or category..."
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

        {/* Add New Item Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Min Quantity"
              value={newItem.minQuantity}
              onChange={(e) => setNewItem({ ...newItem, minQuantity: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="litre">litre</option>
              <option value="meter">meter</option>
              <option value="box">box</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <input
                type="checkbox"
                checked={newItem.borrowable}
                onChange={(e) => setNewItem({ ...newItem, borrowable: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Borrowable</span>
            </label>

            <button
              onClick={handleCreate}
              disabled={!newItem.name || !newItem.category}
              className="col-span-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <FaPlus /> Add Item
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg">
              {searchQuery ? "No items found matching your search." : "No items yet. Add your first one!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 ${
                  item.quantity <= item.minQuantity ? "border-red-400 ring-2 ring-red-100" : ""
                }`}
              >
                <div className="p-4">
                  {editingId === item._id ? (
                    <>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={editingItem.minQuantity}
                        onChange={(e) => setEditingItem({ ...editingItem, minQuantity: e.target.value })}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={editingItem.unit}
                        onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="litre">litre</option>
                        <option value="meter">meter</option>
                        <option value="box">box</option>
                      </select>
                      <label className="flex items-center gap-2 mb-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <input
                          type="checkbox"
                          checked={editingItem.borrowable}
                          onChange={(e) => setEditingItem({ ...editingItem, borrowable: e.target.checked })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">Borrowable</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.files[0] })}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </>
                  ) : (
                    <>
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/150"}
                        alt={item.name}
                        className="w-full h-36 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category.name}</p>
                      <p className="text-sm">Qty: {item.quantity} {item.unit}</p>
                      {item.borrowable && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Borrowable
                        </span>
                      )}
                      {item.quantity <= item.minQuantity && (
                        <p className="text-xs text-red-600 mt-1 font-medium">Low Stock!</p>
                      )}
                    </>
                  )}
                </div>

                <div className="px-4 pb-3 flex justify-end gap-2 border-t border-gray-100 pt-2">
                  {editingId === item._id ? (
                    <>
                      <button
                        onClick={() => saveEdit(item._id)}
                        className="p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
                      >
                        <FaCheck size={16} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                      >
                        <FaTimes size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 shadow-sm"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item._id, item.name)}
                        className="p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition opacity-0 group-hover:opacity-100 shadow-sm"
                      >
                        <FaTrash size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteModal.open}
        title="Delete Item?"
        message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </>
  );
}