import React, { useState, useEffect } from "react";
import { useI18n } from "@/components/i18n";

// TestPage — fake page for pipeline smoke testing
// Contains 3 intentional bugs for CC to find

export default function TestPage() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/items");
      if (!response.ok) throw new Error(t('test_page.fetch_failed'));
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    setError(null);
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t('test_page.delete_failed'));
      setItems(prev => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) return <div className="flex items-center justify-center p-8">{t('common.loading')}</div>;

  return (
    <div className="p-4">
      <h1>{t('test_page.title')}</h1>
      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <p>{error}</p>
          <button
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-sm"
            onClick={() => fetchItems()}
          >
            {t('common.retry')}
          </button>
        </div>
      )}
      {items.length === 0 && !error && <p>{t('test_page.no_items')}</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-2">
          <span className="flex-1 min-w-0 truncate">{item.name || t('test_page.unnamed_item')}</span>
          <button
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100 text-sm"
            disabled={deletingIds.has(item.id)}
            onClick={() => deleteItem(item.id)}
          >
            {deletingIds.has(item.id) ? t('common.loading') : t('common.delete')}
          </button>
        </div>
      ))}
    </div>
  );
}
