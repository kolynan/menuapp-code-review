import React from "react";
import { Loader2, ImageIcon, Minus, Plus, LayoutGrid, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
};

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
  t,
}) {
  const [selectedDish, setSelectedDish] = React.useState(null);

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
        className="overflow-hidden hover:shadow-md transition-shadow border-slate-200"
      >
        <CardContent className="p-3 flex gap-3 items-center">
          {/* Image LEFT - fixed size, tappable when has image */}
          <div
            className={`w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100${dish.image ? ' cursor-pointer' : ''}`}
            onClick={() => dish.image && setSelectedDish(dish)}
          >
            {dish.image ? (
              <img
                src={dish.image}
                alt={getDishName(dish)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                <ImageIcon className="w-6 h-6 opacity-50" />
              </div>
            )}
          </div>

          {/* Text MIDDLE - flexible */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-slate-900 line-clamp-2">{getDishName(dish)}</h3>
            {getDishDescription(dish) && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                {getDishDescription(dish)}
              </p>
            )}
            <div className="mt-1 font-bold text-indigo-600 text-sm">
              {formatPrice(dish.price)}
            </div>
            {showReviews && dishRatings?.[dish.id] && (
              <div className="mt-1">
                <DishRating
                  avgRating={dishRatings[dish.id]?.avg}
                  reviewCount={dishRatings[dish.id]?.count}
                  onClick={onOpenReviews ? () => onOpenReviews(dish.id) : undefined}
                />
              </div>
            )}
          </div>

          {/* Plus button RIGHT - stable */}
          <div className="shrink-0">
            {!inCart ? (
              <button
                onClick={() => addToCart(dish)}
                className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            ) : (
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(dish.id, -1)}
                  className="p-1 hover:bg-white rounded-md transition-colors"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <span className="mx-2 font-medium text-slate-900 text-sm">{inCart.quantity}</span>
                <button
                  onClick={() => updateQuantity(dish.id, 1)}
                  className="p-1 hover:bg-white rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render dish card for TILE mode (grid layout)
  const renderTileCard = (dish) => {
    const inCart = cart.find((i) => i.dishId === dish.id);
    
    return (
      <Card
        key={dish.id}
        className="overflow-hidden hover:shadow-md transition-shadow border-slate-200 flex flex-col"
      >
        <div
          className={`w-full h-48 bg-slate-100 relative${dish.image ? ' cursor-pointer' : ''}`}
          onClick={() => dish.image && setSelectedDish(dish)}
        >
          {dish.image ? (
            <img
              src={dish.image}
              alt={getDishName(dish)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
              <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
              <span className="text-xs font-medium">{t('menu.photo_later')}</span>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-1">
          <div className="flex justify-between gap-4 h-full">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-slate-900">{getDishName(dish)}</h3>
              {getDishDescription(dish) && (
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {getDishDescription(dish)}
                </p>
              )}
              <div className="mt-2 font-bold text-indigo-600">
                {formatPrice(dish.price)}
              </div>
              {showReviews && dishRatings?.[dish.id] && (
                <div className="mt-2">
                  <DishRating
                    avgRating={dishRatings[dish.id]?.avg}
                    reviewCount={dishRatings[dish.id]?.count}
                    onClick={onOpenReviews ? () => onOpenReviews(dish.id) : undefined}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center self-end">
              {!inCart ? (
                <Button
                  size="sm"
                  onClick={() => addToCart(dish)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {t('menu.add')}
                </Button>
              ) : (
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(dish.id, -1)}
                    className="p-1 hover:bg-white rounded-md transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="mx-3 font-medium text-slate-900 text-sm">{inCart.quantity}</span>
                  <button
                    onClick={() => updateQuantity(dish.id, 1)}
                    className="p-1 hover:bg-white rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Photo drawer — bottom sheet shown when user taps a dish photo
  const renderPhotoDrawer = () => {
    if (!selectedDish) return null;

    const inCart = cart.find((i) => i.dishId === selectedDish.id);

    return (
      <>
        {/* Dark overlay */}
        <div
          className="fixed inset-0 bg-black/60 z-50"
          onClick={() => setSelectedDish(null)}
        />

        {/* Drawer */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={() => setSelectedDish(null)}
            className="absolute top-3 right-3 z-10 w-11 h-11 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full transition-colors"
          >
            <span className="text-white text-lg font-bold leading-none">{'\u2715'}</span>
          </button>

          {/* Large photo */}
          {selectedDish.image && (
            <div className="w-full h-[50vh] bg-slate-100">
              <img
                src={selectedDish.image}
                alt={getDishName(selectedDish)}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-5 space-y-3">
            {/* Name */}
            <h2 className="text-xl font-bold text-slate-900">
              {getDishName(selectedDish)}
            </h2>

            {/* Description — full, not truncated */}
            {getDishDescription(selectedDish) && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {getDishDescription(selectedDish)}
              </p>
            )}

            {/* Price */}
            <div className="text-lg font-bold text-indigo-600">
              {formatPrice(selectedDish.price)}
            </div>

            {/* Rating */}
            {showReviews && dishRatings?.[selectedDish.id] && (
              <DishRating
                avgRating={dishRatings[selectedDish.id]?.avg}
                reviewCount={dishRatings[selectedDish.id]?.count}
                onClick={onOpenReviews ? () => onOpenReviews(selectedDish.id) : undefined}
              />
            )}

            {/* Add / Stepper */}
            <div className="pt-2">
              {!inCart ? (
                <button
                  onClick={() => addToCart(selectedDish)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-base"
                >
                  {t('menu.add') || 'Добавить'}
                </button>
              ) : (
                <div className="flex items-center justify-center bg-slate-100 rounded-xl py-2 px-4">
                  <button
                    onClick={() => updateQuantity(selectedDish.id, -1)}
                    className="w-11 h-11 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                  >
                    <Minus className="w-5 h-5 text-slate-600" />
                  </button>
                  <span className="mx-6 text-lg font-bold text-slate-900">{inCart.quantity}</span>
                  <button
                    onClick={() => updateQuantity(selectedDish.id, 1)}
                    className="w-11 h-11 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
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
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{t('menu.tile') || 'Плитка'}</span>
          </button>
          <button
            onClick={() => onSetMobileLayout('list')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mobileLayout === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            <span>{t('menu.list') || 'Список'}</span>
          </button>
        </div>
      )}

      {loadingDishes ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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
                <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : gridColsClass}`}>
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
    </div>
  );
}