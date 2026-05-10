import React from "react";

export default function LoyaltyPanel({ show, earnedPoints, tr }) {
  if (!show) return null;

  return (
    <div className="text-xs text-green-600 mt-1">
      +{earnedPoints} {tr("loyalty.points_short", "баллов")}
    </div>
  );
}
