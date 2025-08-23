'use client';
import { Star } from 'lucide-react';

export default function StarRating({ rating, onRate, editable = false }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={`
            ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            ${editable ? 'cursor-pointer hover:scale-110' : ''}
          `}
          onClick={() => editable && onRate(star)}
        />
      ))}
    </div>
  );
}