import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Loading from "./Loading";
import BooksTable from "../components/BooksTable";
import { useSearchParams } from "react-router-dom";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import { fetchResource } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [editingRowId, setEditingRowId] = useState(null);
  const [editName, setEditName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [newBook, setNewBook] = useState({
    author_id: "",
    name: "",
    page_count: "",
  });
  const { isAuthenticated } = useAuth();

  // Sync search term with URL params
  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchTerm(search);
  }, [searchParams]);

  // Fetch data
  useEffect(() => {
    Promise.all([fetchResource("books"), fetchResource("authors")])
      .then(([booksData, authorsData]) => {
        setBooks(Array.isArray(booksData) ? booksData : [booksData]);
        setAuthors(Array.isArray(authorsData) ? authorsData : [authorsData]);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Filter books based on search
  const filteredBooks = books.filter((book) => {
    if (!searchTerm.trim()) return true;
    return Object.values(book).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Delete book handler
  const deleteBook = (id) => {
    if (!isAuthenticated) return;
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    setBooks((prevBooks) =>
      prevBooks.filter((book) => book.id !== confirmDeleteId)
    );
    setEditingRowId(null);
    setEditName("");
    setConfirmDeleteId(null);
  };

  // Add new book handler
  const handleAddNew = () => {
    if (!isAuthenticated) return;
    if (!newBook.author_id || !newBook.name || !newBook.page_count) {
      alert("All fields are required");
      return;
    }

    const newId =
      books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;
    const newBookObject = {
      id: newId,
      author_id: parseInt(newBook.author_id),
      name: newBook.name,
      page_count: parseInt(newBook.page_count),
    };

    setBooks((prevBooks) => [...prevBooks, newBookObject]);
    setNewBook({ author_id: "", name: "", page_count: "" });
    setShowModal(false);
  };

  const openModal = () => {
    if (!isAuthenticated) return;
    setShowModal(true);
  };

  return (
    <div className="py-6 ">
      <Header
        addNew={openModal}
        title="Books List"
        buttonDisabled={!isAuthenticated}
        buttonHint="Sign in to add books"
      />
      {books.length > 0 ? (
        <BooksTable
          books={filteredBooks}
          authors={authors}
          editingRowId={editingRowId}
          setEditingRowId={setEditingRowId}
          editName={editName}
          setEditName={setEditName}
          setBooks={setBooks}
          deleteBook={deleteBook}
          actionsDisabled={!isAuthenticated}
        />
      ) : (
        <Loading />
      )}
      <Modal
        title="New Book"
        save={handleAddNew}
        cancel={() => setShowModal(false)}
        show={showModal}
        confirmLabel="Save"
        cancelLabel="Close"
        disableConfirm={!isAuthenticated}
      >
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-1"
            >
              Book Name
            </label>
            <input
              id="name"
              type="text"
              value={newBook.name}
              onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter Book Name"
              required
            />
          </div>
          <div>
            <label
              htmlFor="page_count"
              className="block text-gray-700 font-medium mb-1"
            >
              Number of Pages
            </label>
            <input
              id="page_count"
              type="number"
              value={newBook.page_count}
              onChange={(e) =>
                setNewBook({ ...newBook, page_count: e.target.value })
              }
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter Page Count"
              required
            />
          </div>
          <div>
            <label
              htmlFor="author_id"
              className="block text-gray-700 font-medium mb-1"
            >
              Author
            </label>
            <select
              id="author_id"
              value={newBook.author_id}
              onChange={(e) =>
                setNewBook({ ...newBook, author_id: e.target.value })
              }
              className="border border-gray-300 rounded p-2 w-full"
              required
            >
              <option value="" disabled>
                Select an Author
              </option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.first_name} {author.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
      <ConfirmModal
        show={Boolean(confirmDeleteId)}
        title="Delete Book"
        message="Are you sure you want to delete this book?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default Books;
