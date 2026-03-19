import React, { useState, useEffect } from "react";
import { useI18n } from "@/components/useI18n";

// TestPage — fake page for pipeline smoke testing
// Contains 3 intentional bugs for CC to find

export default function TestPage() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setError(null);
    try {
      const response = await fetch("/api/items");
      if (!response.ok) throw new Error(t('test_page.fetch_failed'));
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t('test_page.delete_failed'));
      setItems(prev => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>{t('common.loading')}</div>;

  return (
    <div className="p-4">
      <h1>{t('test_page.title')}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {items.length === 0 && !error && <p>{t('test_page.no_items')}</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-2">
          {item.name}
          <button
            className="min-h-[44px] min-w-[44px] px-3 py-2"
            disabled={deletingId === item.id}
            onClick={() => deleteItem(item.id)}
          >
            {deletingId === item.id ? t('common.loading') : t('common.delete')}
          </button>
        </div>
      ))}
    </div>
  );
}
