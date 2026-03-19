import React, { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/components/i18n";

// TestPage — fake page for pipeline smoke testing

const KNOWN_ERROR_KEYS = ['test_page.fetch_failed', 'test_page.invalid_response', 'test_page.delete_failed'];

function toErrorKey(err) {
  return KNOWN_ERROR_KEYS.includes(err.message) ? err.message : 'common.error';
}

export default function TestPage() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const mountedRef = useRef(true);
  const abortRef = useRef(null);

  const fetchItems = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/items", { signal });
      if (!response.ok) throw new Error('test_page.fetch_failed');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('test_page.invalid_response');
      if (!mountedRef.current) return;
      setItems(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (!mountedRef.current) return;
      setError(toErrorKey(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const deleteItem = async (id) => {
    setError(null);
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error('test_page.delete_failed');
      if (!mountedRef.current) return;
      setItems(prev => prev.filter((i) => i.id !== id));
    } catch (err) {
      if (!mountedRef.current) return;
      setError(toErrorKey(err));
    } finally {
      if (mountedRef.current) {
        setDeletingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      }
    }
  };

  const handleRetry = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchItems(controller.signal);
  }, [fetchItems]);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    fetchItems(controller.signal);
    return () => { controller.abort(); mountedRef.current = false; };
  }, [fetchItems]);

  if (loading) return <div className="flex items-center justify-center p-8">{t('common.loading')}</div>;

  return (
    <div className="p-4">
      <h1>{t('test_page.title')}</h1>
      {error && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-red-500">
          <p>{t(error)}</p>
          <button
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-sm"
            onClick={handleRetry}
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
            aria-label={`${t('common.delete')} ${item.name || t('test_page.unnamed_item')}`}
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
