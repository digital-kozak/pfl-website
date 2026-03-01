import type { APIRoute } from 'astro';
import reviewsData from '../../data/reviews.json';

const { reviews, totalReviews } = reviewsData;
const reviewsPerPage = 12;

export const GET: APIRoute = ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  
  // Validate page
  if (page < 1 || page > totalPages) {
    return new Response(
      JSON.stringify({ error: 'Page not found' }),
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Calculate slice
  const start = (page - 1) * reviewsPerPage;
  const end = start + reviewsPerPage;
  const pageReviews = reviews.slice(start, end);
  
  return new Response(
    JSON.stringify({
      reviews: pageReviews,
      pagination: {
        page,
        totalPages,
        totalReviews,
        reviewsPerPage,
        start: start + 1,
        end: Math.min(end, totalReviews),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    }
  );
};