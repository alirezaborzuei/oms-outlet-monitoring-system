import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handleClick = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  return (
    <div className="flex justify-center items-center mt-4">
      <button
        onClick={() => handleClick(currentPage - 1)}
        className="px-3 py-1 mx-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
        disabled={currentPage === 1}
      >
        قبلی
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => handleClick(index + 1)}
          className={`px-3 py-1 mx-1 rounded-md border ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={() => handleClick(currentPage + 1)}
        className="px-3 py-1 mx-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
        disabled={currentPage === totalPages}
      >
        بعدی
      </button>
    </div>
  );
};

export default Pagination;
