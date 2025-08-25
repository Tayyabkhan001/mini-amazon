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
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Customer Reviews</h3>

      {/* Add Review Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h4 className="font-semibold mb-4 text-lg text-gray-800">Write a Review</h4>

        <div className="mb-4">
          <StarRating
            rating={userReview.rating}
            onRate={(rating) => setUserReview({...userReview, rating})}
            editable
          />
        </div>

        <textarea
          placeholder="Share your experience with this product..."
          value={userReview.comment}
          onChange={(e) => setUserReview({...userReview, comment: e.target.value})}
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          rows="4"
        />

        <button
          onClick={submitReview}
          disabled={userReview.rating === 0 || userReview.comment.trim() === ''}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-4 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          Submit Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <StarRating rating={review.rating} />
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>

              <p className="text-gray-700 mb-2 leading-relaxed">{review.comment}</p>

              <p className="text-sm text-gray-600 font-medium">by {review.user}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}