import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../api/apiSlice";
import { useState } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";

export default function Categories() {
  const { data: categories = [], isLoading, isError } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Delete Modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState(""); // For showing name in modal

  // Create
  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCategory({ name: name.trim() }).unwrap();
    setName("");
  };

  // Edit
  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id) => {
    if (!editingName.trim()) return;
    await updateCategory({ id, name: editingName.trim() }).unwrap();
    cancelEdit();
  };

  // Delete
  const openDeleteModal = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteCategory(deleteId).unwrap();
    }
    setConfirmOpen(false);
    setDeleteId(null);
    setDeleteName("");
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 animate-pulse">Loading categories...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Failed to load categories.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Categories</h1>

      {/* Add New Category */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md"
          >
            <FaPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">No categories yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6 text-center">
                {editingId === cat._id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(cat._id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                    className="w-full px-4 py-3 text-lg font-medium text-center border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
                    placeholder="Category name"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-gray-800 truncate">{cat.name}</h3>
                )}
              </div>

              {/* Action Buttons – EXACTLY like Items.jsx */}
              <div className="px-5 pb-5 flex justify-end gap-3 border-t border-gray-100 pt-4 bg-gray-50">
                {editingId === cat._id ? (
                  <>
                    <button
                      onClick={() => saveEdit(cat._id)}
                      disabled={!editingName.trim()}
                      className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      title="Save"
                    >
                      <FaCheck size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition active:scale-95"
                      title="Cancel"
                    >
                      <FaTimes size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition opacity-0 group-hover:opacity-100 shadow-md active:scale-95"
                      title="Edit Category"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(cat._id, cat.name)}
                      className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition opacity-0 group-hover:opacity-100 shadow-md active:scale-95"
                      title="Delete Category"
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Category?"
        message={`Are you sure you want to delete "${deleteName}"? Items in this category will not be deleted, but will lose their category.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}