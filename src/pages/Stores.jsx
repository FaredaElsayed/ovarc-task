import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Loading from "./Loading";
import Table from "../components/Table/Table";
import { useSearchParams } from "react-router-dom";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import TableActions from "../components/ActionButton/TableActions";
import { useNavigate } from "react-router-dom";
import { fetchResource } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const Stores = () => {
  const navigate = useNavigate();

  const handleViewStoreInventory = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  // State declarations
  const [stores, setStores] = useState([]);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [editingRowId, setEditingRowId] = useState(null);
  const [editName, setEditName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    address: "",
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { isAuthenticated } = useAuth();

  // Sync search term with URL query parameters
  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchTerm(search);
  }, [searchParams]);

  // Fetch stores data
  useEffect(() => {
    fetchResource("stores")
      .then((data) => {
        console.log("Fetched stores:", data);
        setStores(Array.isArray(data) ? data : [data]);
      })
      .catch((error) => console.error("Error fetching stores:", error));
  }, []);

  // Enrich stores with computed address and filter based on search term
  const filteredStores = useMemo(() => {
    const enrichedStores = stores.map((store) => ({
      ...store,
      full_address: `${store.address_1}${
        store.address_2 ? `, ${store.address_2}` : ""
      }, ${store.city}, ${store.state} ${store.zip}`,
    }));

    if (!searchTerm.trim()) return enrichedStores;

    const lowerSearch = searchTerm.toLowerCase();
    return enrichedStores.filter((store) =>
      Object.values(store).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
  }, [stores, searchTerm]);

  // Define table columns
  useEffect(() => {
    if (!isAuthenticated) {
      setEditingRowId(null);
      setEditName("");
    }
  }, [isAuthenticated]);

  const columns = useMemo(
    () => [
      { header: "Store Id", accessorKey: "id" },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) =>
          editingRowId === row.original.id ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave(row.original.id);
                if (e.key === "Escape") handleCancel();
              }}
              className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            row.original.name
          ),
      },
      { header: "Address", accessorKey: "full_address" },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <TableActions
            row={row}
            onEdit={
              editingRowId === row.original.id
                ? handleCancel
                : () => handleEdit(row.original)
            }
            onDelete={() => deleteStore(row.original.id, row.original.name)}
            disabled={!isAuthenticated}
          />
        ),
      },
    ],
    [editingRowId, editName, isAuthenticated]
  );

  // Handle store deletion
  const deleteStore = (id) => {
    if (!isAuthenticated) return;
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    setStores((prevStores) =>
      prevStores.filter((store) => store.id !== confirmDeleteId)
    );
    setEditingRowId(null);
    setEditName("");
    setConfirmDeleteId(null);
  };

  // Initiate editing
  const handleEdit = (store) => {
    if (!isAuthenticated) return;
    setEditingRowId(store.id);
    setEditName(store.name);
  };

  // Save edited name
  const handleSave = (id) => {
    if (!isAuthenticated) return;
    setStores(
      stores.map((store) =>
        store.id === id ? { ...store, name: editName } : store
      )
    );
    setEditingRowId(null);
    setEditName("");
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingRowId(null);
    setEditName("");
  };

  // Modal controls
  const openModal = () => {
    if (!isAuthenticated) return;
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setNewStore({
      name: "",
      address: "",
    });
  };

  // Parse address to extract address_1, address_2, city, state, and zip
  const parseAddress = (address) => {
    if (!address || address.trim() === "") {
      return { address_1: "", address_2: "", city: "", state: "", zip: "" };
    }

    // Split the address by commas
    const parts = address.split(",").map((part) => part.trim());

    if (parts.length < 3) {
      return {
        address_1: address,
        address_2: "",
        city: "",
        state: "",
        zip: "",
      };
    }

    // Last part should be "state zip"
    const lastPart = parts[parts.length - 1].trim();
    const stateZipMatch = lastPart.match(/(\w+)\s+(\d{5})/);
    let state = "";
    let zip = "";
    if (stateZipMatch) {
      state = stateZipMatch[1];
      zip = stateZipMatch[2];
    } else {
      state = lastPart;
      zip = "";
    }

    const city = parts[parts.length - 2];

    const address_1 = parts[0];
    const address_2 = parts.length > 3 ? parts[1] : "";

    return { address_1, address_2, city, state, zip };
  };

  // Add new store
  const handleAddNew = () => {
    if (!isAuthenticated) return;
    if (newStore.name.trim() === "" || newStore.address.trim() === "") {
      alert("Store Name and Address are required");
      return;
    }

    // Parse the address to extract fields
    const { address_1, address_2, city, state, zip } = parseAddress(
      newStore.address
    );

    if (!city || !state || !zip) {
      alert(
        'Address must include city, state, and zip (e.g., "123 Main St, Athens, GA 30605")'
      );
      return;
    }

    const newId =
      stores.length > 0 ? Math.max(...stores.map((s) => s.id)) + 1 : 1;
    const newStoreObject = {
      id: newId,
      name: newStore.name,
      address_1,
      address_2,
      city,
      state,
      zip,
    };

    setStores((prevStores) => [...prevStores, newStoreObject]);
    setNewStore({
      name: "",
      address: "",
    });
    closeModal();
  };
  const onRowClick = (row) => {
    console.log("Row clicked:", row);
    if (!row?.id) return;
    handleViewStoreInventory(row.id);
  };
  return (
    <div className="py-6">
      <Header
        addNew={openModal}
        title="Stores List"
        buttonDisabled={!isAuthenticated}
        buttonHint="Sign in to add stores"
      />
      {stores.length > 0 ? (
        <Table
          data={filteredStores}
          columns={columns}
          onRowClick={onRowClick}
        />
      ) : (
        <Loading />
      )}
      <Modal
        title="New Store"
        save={handleAddNew}
        cancel={closeModal}
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
              Store Name
            </label>
            <input
              id="name"
              type="text"
              value={newStore.name}
              onChange={(e) =>
                setNewStore({ ...newStore, name: e.target.value })
              }
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter Store Name"
              required
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-gray-700 font-medium mb-1"
            >
              Address
            </label>
            <input
              id="address"
              type="text"
              value={newStore.address}
              onChange={(e) =>
                setNewStore({ ...newStore, address: e.target.value })
              }
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="e.g., 123 Main St, 2nd Floor, Athens, GA 30605"
              required
            />
          </div>
        </div>
      </Modal>
      <ConfirmModal
        show={Boolean(confirmDeleteId)}
        title="Delete Store"
        message="Are you sure you want to delete this store?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default Stores;
