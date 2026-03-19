import React, { useState, useEffect } from "react";

// TestPage — fake page for pipeline smoke testing
// Contains 3 intentional bugs for CC to find

export default function TestPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("fetchItems error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error("deleteItem error:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Test Page</h1>
      {items.map((item) => (
        <div key={item.id}>
          {item.name}
          <button onClick={() => deleteItem(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
