import React, { useState } from "react";

const Pagination = ({ totalPages, currentPage, setCurrentPage }) => {
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxButtons = 5; // Number of buttons to display (excluding first and last)
    const half = Math.floor(maxButtons / 2);

    // Calculate start and end pages
    let startPage = Math.max(2, currentPage - half);
    let endPage = Math.min(totalPages - 1, currentPage + half);

    // Adjust if there are not enough pages to display
    if (currentPage - half < 2) {
      endPage = Math.min(totalPages - 1, endPage + (half - (currentPage - 2)));
    }

    if (currentPage + half > totalPages - 1) {
      startPage = Math.max(
        2,
        startPage - (currentPage + half - totalPages + 1)
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex mt-4">
      <button
        type="button"
        className={`btn btn-sm ms-1 ${
          currentPage === 1 ? "btn-secondary" : "btn-primary"
        }`}
        disabled={currentPage === 1}
        onClick={prevPage}
      >
        Previous
      </button>
      <button
        type="button"
        className={`btn btn-sm ms-1 ${
          currentPage === 1 ? "btn-primary" : "btn-outline-primary"
        }`}
        onClick={() => setCurrentPage(1)}
      >
        1
      </button>
      {pageNumbers.map((number) => (
        <button
          type="button"
          key={number}
          className={`btn btn-sm ms-1 ${
            number === currentPage ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </button>
      ))}
      {totalPages > 1 && (
        <button
          type="button"
          className={`btn btn-sm ms-1 ${
            currentPage === totalPages ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      )}
      <button
        type="button"
        className={`btn btn-sm ms-1 ${
          currentPage === totalPages ? "btn-secondary" : "btn-primary"
        }`}
        disabled={currentPage === totalPages}
        onClick={nextPage}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
