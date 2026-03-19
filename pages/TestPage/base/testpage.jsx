import React, { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/components/i18n";
import { Loader2 } from "lucide-react";

// TestPage — minimal fake page for pipeline smoke testing
// Contains intentional patterns for reviewers to find:
// - missing cleanup on unmount, no error i18n key validation, no loading skeleton

export default function TestPage() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback((signal) => {
    setLoading(true);
    setError(null);
    fetch("/api/items", { signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error("Invalid response format");
        setItems(data.filter(item => item && item.id));
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(t('test_page.error'));
        setLoading(false);
      });
  }, [t]);

  useEffect(() => {
    const controller = new AbortController();
    fetchItems(controller.signal);
    return () => controller.abort();
  }, [fetchItems]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">{t('test_page.title')}</h1>
      {error && (
        <div className="text-red-500 flex items-center gap-2 mb-4">
          <p>{error}</p>
          <button
            className="px-3 py-2 text-sm border rounded min-h-[44px] min-w-[44px]"
            onClick={() => fetchItems()}
          >
            {t('common.retry')}
          </button>
        </div>
      )}
      {items.length === 0 && !error && <p>{t('test_page.no_items')}</p>}
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between py-2 border-b">
          <span className="flex-1 min-w-0 truncate">{item.name}</span>
          <button
            className="px-3 py-2 text-sm border rounded min-h-[44px] min-w-[44px] ml-2"
            onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
          >
            {t('common.delete')}
          </button>
        </div>
      ))}
    </div>
  );
}
