'use client';
import { useState } from 'react';
import StarRating from '../StarRating';

export default function ReviewSection({ productId, reviews }) {
  const [userReview, setUserReview] = useState({ rating: 0, comment: '' });

  const submitReview = () => {
    // Handle review submission
    console.log('Submitting review:', userReview);
    setUserReview({ rating: 0, comment: '' });
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>

      {/* Add Review Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium mb-2">Write a Review</h4>
        <StarRating
          rating={userReview.rating}
          onRate={(rating) => setUserReview({...userReview, rating})}
          editable
        />
        <textarea
          placeholder="Share your experience..."
          value={userReview.comment}
          onChange={(e) => setUserReview({...userReview, comment: e.target.value})}
          className="w-full p-2 border rounded mt-2"
          rows="3"
        />
        <button
          onClick={submitReview}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600"
        >
          Submit Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <StarRating rating={review.rating} />
            <p className="text-gray-600 mt-1">{review.comment}</p>
            <p className="text-sm text-gray-400">by {review.user} on {review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}