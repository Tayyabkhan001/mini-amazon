'use client';
import { Star } from 'lucide-react';

export default function StarRating({ rating, onRate, editable = false, size = 24 }) {
  const handleClick = (star) => {
    if (editable && onRate) {
      onRate(star);
    }
  };

  const handleMouseEnter = (star) => {
    if (editable) {
      // Add visual feedback for hover if needed
    }
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`p-1 transition-transform duration-150 ${
            editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          disabled={!editable}
        >
          <Star
            size={size}
            className={`transition-colors duration-200 ${
              star <= rating
                ? 'text-yellow-400 fill-current drop-shadow-sm'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}

      {rating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}