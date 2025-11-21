// src/pages/Inventory.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Header from "../components/Header";
import Loading from "./Loading";
import useLibraryData from "../hooks/useLibraryData";
import TableActions from "../components/ActionButton/TableActions";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";

const Inventory = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const numericStoreId = Number(storeId);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [editingBookId, setEditingBookId] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [newBookPrice, setNewBookPrice] = useState("");
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  const {
    storeBooks,
    books,
    inventory,
    setInventory,
    authorMap,
    currentStore,
    isLoading,
  } = useLibraryData({ storeId: numericStoreId, searchTerm });

  const { isAuthenticated } = useAuth();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const getAuthorName = useCallback(
    (book) => authorMap[book.author_id]?.name || "Unknown Author",
    [authorMap]
  );

  const sortedBooks = useMemo(() => {
    const data = [...storeBooks];
    const { key, direction } = sortConfig;
    const multiplier = direction === "asc" ? 1 : -1;

    data.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === "author") {
        aValue = getAuthorName(a);
        bValue = getAuthorName(b);
      }

      if (key === "price") {
        aValue = a.price ?? Number.POSITIVE_INFINITY;
        bValue = b.price ?? Number.POSITIVE_INFINITY;
      }

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });

    return data;
  }, [storeBooks, sortConfig, getAuthorName]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const resetEditing = () => {
    setEditingBookId(null);
    setPriceInput("");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      resetEditing();
    }
  }, [isAuthenticated]);

  const handleDelete = (bookId) => {
    if (!isAuthenticated) return;
    setConfirmDeleteId(bookId);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    setInventory((prev) =>
      prev.filter(
        (item) =>
          !(
            item.store_id === numericStoreId &&
            item.book_id === Number(confirmDeleteId)
          )
      )
    );
    resetEditing();
    setConfirmDeleteId(null);
  };

  const handleEdit = (book) => {
    if (!isAuthenticated) return;
    setEditingBookId(book.id);
    setPriceInput(book.price != null ? String(book.price) : "");
  };

  const handleSavePrice = (bookId) => {
    if (!isAuthenticated) return;
    const parsedPrice = Number(priceInput);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Please enter a valid price (greater than 0).");
      return;
    }

    setInventory((prev) =>
      prev.map((item) =>
        item.store_id === numericStoreId && item.book_id === Number(bookId)
          ? { ...item, price: parsedPrice }
          : item
      )
    );
    resetEditing();
  };

  const availableBooks = useMemo(() => {
    return books.filter(
      (book) =>
        !inventory.some(
          (entry) =>
            entry.store_id === numericStoreId && entry.book_id === book.id
        )
    );
  }, [books, inventory, numericStoreId]);

  const filteredBookOptions = useMemo(() => {
    const lower = bookSearchTerm.toLowerCase();
    return availableBooks
      .filter((book) => book.name.toLowerCase().includes(lower))
      .slice(0, 7);
  }, [availableBooks, bookSearchTerm]);

  const handleAddBook = () => {
    if (!isAuthenticated) {
      setErrors({
        newBookPrice: { message: "Sign in to add inventory" },
      });
      return;
    }
    if (!selectedBookId) {
      alert("Please select a book to add.");
      return;
    }
    const parsedPrice = Number(newBookPrice);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrors((prev) => ({
        ...prev,
        newBookPrice: { message: "Price must be greater than 0" },
      }));
      return;
    }

    const newInventoryId =
      inventory.length > 0
        ? Math.max(...inventory.map((entry) => entry.id || 0)) + 1
        : 1;

    setInventory((prev) => [
      ...prev,
      {
        id: newInventoryId,
        store_id: numericStoreId,
        book_id: Number(selectedBookId),
        price: parsedPrice,
      },
    ]);

    setSelectedBookId("");
    setNewBookPrice("");
    setBookSearchTerm("");
    closeModal();
  };

  const openAddModal = () => {
    if (!isAuthenticated) {
      setErrors({
        newBookPrice: { message: "Sign in to add inventory" },
      });
      return;
    }
    setErrors({});
    setSelectedBookId("");
    setNewBookPrice("");
    setBookSearchTerm("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setErrors({});
  };

  if (Number.isNaN(numericStoreId)) {
    return (
      <div className="py-6">
        <p className="text-red-500">
          Invalid store identifier.{" "}
          <button
            className="underline text-main"
            onClick={() => navigate("/stores")}
          >
            Go back to stores
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <Header
        addNew={openAddModal}
        title={
          currentStore ? `${currentStore.name} Inventory` : "Store Inventory"
        }
        buttonTitle="Add to inventory"
        buttonDisabled={!isAuthenticated}
        buttonHint="Sign in to add inventory"
      />

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search books, authors, prices..."
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/3"
        />
        <button
          className="px-4 py-2 border rounded text-sm"
          onClick={() => navigate("/stores")}
        >
          Back
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : storeBooks.length === 0 ? (
        <div className="bg-white border border-dashed rounded-lg p-8 text-center text-gray-500">
          No books found in this store. Add one to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: "id", label: "Book Id" },
                  { key: "name", label: "Name" },
                  { key: "page_count", label: "Pages" },
                  { key: "author", label: "Author" },
                  { key: "price", label: "Price" },
                  { key: "actions", label: "Actions" },
                ].map((column) => (
                  <th
                    key={column.key}
                    className="text-left px-4 py-2 text-sm font-semibold text-gray-600 border-b cursor-pointer select-none"
                    onClick={() =>
                      column.key !== "actions" && handleSort(column.key)
                    }
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.key !== "actions" &&
                        sortConfig.key === column.key && (
                          <span>
                            {sortConfig.direction === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedBooks.map((book) => (
                <tr key={book.id} className="border-b last:border-0">
                  <td className="px-4 py-2 text-sm text-gray-800">{book.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {book.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {book.page_count}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {getAuthorName(book)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {editingBookId === book.id && isAuthenticated ? (
                      <input
                        type="number"
                        step="0.01"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePrice(book.id);
                          if (e.key === "Escape") resetEditing();
                        }}
                        className="border border-gray-300 rounded px-2 py-1 w-24"
                        autoFocus
                      />
                    ) : book.price != null ? (
                      `$${Number(book.price).toFixed(2)}`
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {isAuthenticated ? (
                      <div className="flex gap-2">
                        <TableActions
                          row={book}
                          onEdit={(row) =>
                            editingBookId === row.id
                              ? handleSavePrice(row.id)
                              : handleEdit(row)
                          }
                          onDelete={() => handleDelete(book.id)}
                        />
                        {editingBookId === book.id && (
                          <button
                            className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-600"
                            onClick={resetEditing}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Sign in to manage inventory
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        title="Add book to store"
        save={handleAddBook}
        cancel={closeModal}
        show={showModal}
        confirmLabel="Save"
        cancelLabel="Close"
        disableConfirm={!isAuthenticated}
      >
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Search book
            </label>
            <input
              type="text"
              value={bookSearchTerm}
              onChange={(e) => setBookSearchTerm(e.target.value)}
              placeholder="Filter by title..."
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select book
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value="" disabled>
                {filteredBookOptions.length > 0
                  ? "Choose a book"
                  : "No books available"}
              </option>
              {filteredBookOptions.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name} — {authorMap[book.author_id]?.name || "Unknown"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={newBookPrice}
              onChange={(e) => {
                setNewBookPrice(e.target.value);
                setErrors((prev) => {
                  if (!prev.newBookPrice) return prev;
                  const { newBookPrice: _removed, ...rest } = prev;
                  return rest;
                });
              }}
              className={`border rounded p-2 w-full ${
                errors.newBookPrice ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter price (e.g., 19.99)"
              disabled={!isAuthenticated}
            />
            {errors.newBookPrice && (
              <p className="mt-1 text-sm text-red-600">
                {errors.newBookPrice.message}
              </p>
            )}
          </div>
        </div>
      </Modal>
      <ConfirmModal
        show={Boolean(confirmDeleteId)}
        title="Remove Book"
        message="Remove this book from the store inventory?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default Inventory;
