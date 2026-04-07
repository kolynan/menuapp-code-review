import React from "react";
import { Loader2, ImageIcon, Minus, Plus, LayoutGrid, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import DishRating from "@/components/publicMenu/DishRating";

// Grid mappings for Tailwind (explicit full class names)
const DESKTOP_GRID = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
};

const MOBILE_GRID = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

function darkenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export default function MenuView({
  partner,
  isMobile,
  mobileLayout,
  onSetMobileLayout,
  showReviews,
  dishRatings,
  onOpenReviews,
  listTopRef,
  loadingDishes,
  sortedCategories,
  groupedDishes,
  getCategoryName,
  sectionRefs,
  cart,
  getDishName,
  getDishDescription,
  formatPrice,
  addToCart,
  updateQuantity,
  onDishClick,
  t,
}) {
  const primaryColor = partner?.primary_color || '#1A1A1A';

  // Toast state for add-to-cart feedback (AC-09)
  const [toastVisible, setToastVisible] = React.useState(false);
  const toastTimerRef = React.useRef(null);

  const handleAddToCart = React.useCallback((dish) => {
    addToCart(dish);
    // Non-stacking: clear previous timer before setting new one
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
  }, [addToCart]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  // Read grid settings from partner with safe fallback
  const rawDesktop = partner?.menu_grid_desktop;
  const rawMobile = partner?.menu_grid_mobile;

  const desktopCols = DESKTOP_GRID[rawDesktop] ? rawDesktop : 3;
  const mobileCols = MOBILE_GRID[rawMobile] ? rawMobile : 2;

  const gridColsClass = `${MOBILE_GRID[mobileCols]} ${DESKTOP_GRID[desktopCols]}`;

  // Render dish card for LIST mode (horizontal layout)
  const renderListCard = (dish) => {
    const inCart = cart.find((i) => i.dishId === dish.id);
    
    return (
      <Card
        key={dish.id}
        className="overflow-hidden hover:shadow-md transition-shadow border-slate-200 cursor-pointer"
        onClick={() => onDishClick?.(dish)}
      >
        <CardContent className="p-3 flex gap-3">
          {/* Text LEFT — name, description, price, stepper */}
          <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[96px]">
            <div>
              <h3 className="font-semibold text-base text-slate-900 line-clamp-2">{getDishName(dish)}</h3>
              {getDishDescription(dish) && (
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                  {getDishDescription(dish)}
                </p>
              )}
              {partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0 ? (
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-bold text-sm" style={{ color: primaryColor }}>
                    {formatPrice(parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2)))}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(dish.price)}
                  </span>
                </div>
              ) : (
                <div className="mt-0.5 font-bold text-sm" style={{color: primaryColor}}>
                  {formatPrice(dish.price)}
                </div>
              )}
              {showReviews && dishRatings?.[dish.id] && (
                <div className="mt-0.5">
                  <DishRating
                    avgRating={dishRatings[dish.id]?.avg}
                    reviewCount={dishRatings[dish.id]?.count}
                    onClick={onOpenReviews ? () => onOpenReviews(dish.id) : undefined}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Image RIGHT — fixed size, "+" button overlay (PM-108+PM-110) */}
          <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
            {dish.image ? (
              <img
                src={dish.image}
                alt={getDishName(dish)}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                <ImageIcon className="w-6 h-6 opacity-50" />
              </div>
            )}
            {/* Discount badge (top-left of list image) */}
            {partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0 && (
              <span
                className="absolute top-1 left-1 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm"
                style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}
              >
                -{partner.discount_percent}%
              </span>
            )}
            {/* Add/Stepper button — overlay on image bottom-right (PM-108+PM-110+PM-115) */}
            <div className="absolute bottom-1 right-1 z-10" onClick={(e) => e.stopPropagation()}>
              {!inCart ? (
                <button
                  onClick={() => handleAddToCart(dish)}
                  aria-label={t('menu.add')}
                  className="w-9 h-9 flex items-center justify-center text-white rounded-full shadow-md transition-colors"
                  style={{backgroundColor: primaryColor}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkenColor(primaryColor, 0.15)}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                >
                  <Plus className="w-5 h-5" />
                </button>
              ) : (
                <div className="h-9 px-1 flex items-center gap-0.5 bg-white rounded-full shadow-md whitespace-nowrap">
                  <button
                    onClick={() => updateQuantity(dish.id, -1)}
                    aria-label={t('menu.remove')}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-700" />
                  </button>
                  <span className="min-w-[16px] text-center text-xs font-semibold text-slate-900">
                    {inCart.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(dish.id, 1)}
                    aria-label={t('menu.add')}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render dish card for TILE mode (grid layout)
  // S72: Redesigned — flex-col alignment, round "+" on photo, pill stepper, no placeholder text
  const renderTileCard = (dish) => {
    const inCart = cart.find((i) => i.dishId === dish.id);

    return (
      <Card
        key={dish.id}
        className="relative overflow-hidden hover:shadow-md transition-shadow border-slate-200 flex flex-col cursor-pointer"
        onClick={() => onDishClick?.(dish)}
      >
        {/* Image area — "+" overlay on image (PM-111) */}
        <div className="relative w-full h-36 sm:h-48 bg-slate-100">
          {dish.image ? (
            <img
              src={dish.image}
              alt={getDishName(dish)}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <ImageIcon className="w-10 h-10 text-slate-300 opacity-30" aria-hidden="true" />
            </div>
          )}

          {/* Discount badge (top-left) */}
          {partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0 && (
            <span
              className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm z-10"
              style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}
            >
              -{partner.discount_percent}%
            </span>
          )}

          {/* Add/Stepper button — overlay on image bottom-right (PM-111) */}
          <div className="absolute bottom-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
            {!inCart ? (
              <button
                onClick={() => handleAddToCart(dish)}
                aria-label={t('menu.add')}
                className="w-11 h-11 flex items-center justify-center text-white rounded-full shadow-md transition-colors"
                style={{backgroundColor: primaryColor}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkenColor(primaryColor, 0.15)}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
              >
                <Plus className="w-5 h-5" />
              </button>
            ) : (
              <div className="h-11 px-1.5 flex items-center gap-1 bg-white rounded-full shadow-md whitespace-nowrap">
                <button
                  onClick={() => updateQuantity(dish.id, -1)}
                  aria-label={t('menu.remove')}
                  className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-4 h-4 text-slate-700" />
                </button>
                <span className="min-w-[18px] text-center text-sm font-semibold text-slate-900">
                  {inCart.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(dish.id, 1)}
                  aria-label={t('menu.add')}
                  className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content: vertical layout, price pinned to bottom */}
        <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-base sm:text-lg text-slate-900 line-clamp-2">
            {getDishName(dish)}
          </h3>

          {getDishDescription(dish) && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-1">
              {getDishDescription(dish)}
            </p>
          )}

          <div className="mt-auto pt-2 space-y-1">
            {partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0 ? (
              <div className="flex items-baseline gap-1.5 flex-nowrap">
                <span className="font-bold text-sm whitespace-nowrap" style={{ color: primaryColor }}>
                  {formatPrice(Math.round(dish.price * (1 - partner.discount_percent / 100)))}
                </span>
                <span className="text-xs text-slate-400 line-through whitespace-nowrap">
                  {formatPrice(dish.price)}
                </span>
              </div>
            ) : (
              <div className="font-bold" style={{color: primaryColor}}>
                {formatPrice(dish.price)}
              </div>
            )}

            {showReviews && dishRatings?.[dish.id] && (
              <DishRating
                avgRating={dishRatings[dish.id]?.avg}
                reviewCount={dishRatings[dish.id]?.count}
                onClick={onOpenReviews ? () => onOpenReviews(dish.id) : undefined}
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 mt-4 space-y-8" ref={listTopRef}>
      {/* Mobile layout toggle - only visible on mobile */}
      {isMobile && onSetMobileLayout && !loadingDishes && sortedCategories.length > 0 && (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onSetMobileLayout('tile')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mobileLayout === 'tile'
                ? 'text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={mobileLayout === 'tile' ? {backgroundColor: primaryColor} : undefined}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{t('menu.tile')}</span>
          </button>
          <button
            onClick={() => onSetMobileLayout('list')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mobileLayout === 'list'
                ? 'text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={mobileLayout === 'list' ? {backgroundColor: primaryColor} : undefined}
          >
            <List className="w-4 h-4" />
            <span>{t('menu.list')}</span>
          </button>
        </div>
      )}

      {loadingDishes ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{color: primaryColor}} />
        </div>
      ) : sortedCategories.length > 0 ? (
        sortedCategories.map((category) => {
          const categoryDishes = groupedDishes[category.id];
          if (!categoryDishes) return null;

          return (
            <div
              key={category.id}
              id={`category-${category.id}`}
              ref={(el) => (sectionRefs.current[category.id] = el)}
              className="space-y-3 scroll-mt-[60px]"
            >
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">
                {getCategoryName(category)}
              </h3>

              {/* Render based on mobile layout or desktop */}
              {isMobile && mobileLayout === 'list' ? (
                <div className="space-y-3">
                  {categoryDishes.map(renderListCard)}
                </div>
              ) : (
                <div className={`grid gap-3 ${isMobile ? (MOBILE_GRID[mobileCols] || 'grid-cols-2') : gridColsClass}`}>
                  {categoryDishes.map(renderTileCard)}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 text-slate-500">
          <p>{t('menu.no_items')}</p>
        </div>
      )}

      {/* Toast feedback on add to cart (AC-09) */}
      {toastVisible && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 text-white text-sm rounded-lg px-4 py-2 min-h-[36px] flex items-center shadow-lg pointer-events-none">
          {t('menu.added_to_cart', '\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443')}
        </div>
      )}
    </div>
  );
}