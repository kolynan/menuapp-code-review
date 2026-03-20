import React, { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/components/i18n";
import { Loader2 } from "lucide-react";

// TestPage — minimal fake page for pipeline smoke testing

export default function TestPage() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState(null);
  const abortRef = useRef(null);

  const fetchItems = useCallback((signal) => {
    setLoading(true);
    setErrorKey(null);
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
        setErrorKey('test_page.error');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    fetchItems(controller.signal);
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchItems]);

  const handleRetry = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchItems(controller.signal);
  }, [fetchItems]);

  const handleDelete = useCallback((id) => {
    // TODO: Add backend DELETE call when TestPage supports persistence
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  if (loading && items.length === 0) {
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
      {loading && items.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      )}
      {errorKey && (
        <div role="alert" className="text-red-500 flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
          <p>{t(errorKey)}</p>
          <button
            className="px-3 py-2 text-sm border rounded min-h-[44px] min-w-[44px]"
            onClick={handleRetry}
          >
            {t('common.retry')}
          </button>
        </div>
      )}
      {items.length === 0 && !errorKey && <p>{t('test_page.no_items')}</p>}
      <ul>
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between py-2 border-b">
            <span className="flex-1 min-w-0 truncate">{item.name || t('test_page.unnamed_item')}</span>
            <button
              className="px-3 py-2 text-sm border rounded min-h-[44px] min-w-[44px] ml-2"
              aria-label={t('test_page.delete_item', { name: item.name || t('test_page.unnamed_item') })}
              onClick={() => handleDelete(item.id)}
            >
              {t('common.delete')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
