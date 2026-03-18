import React, { useState, useEffect } from "react";

// TestPage — fake page for pipeline smoke testing

export default function TestPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const deleteItem = async (id) => {
    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Test Page</h1>
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 py-1">
          {item.name}
          <button
            className="px-2 py-1 text-sm bg-red-500 text-white rounded"
            onClick={() => deleteItem(item.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
