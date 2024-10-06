"use client";

import React, { useState } from 'react';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center">
      <div className="flex mx-auto">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-64 h-8 px-2 text-sm bg-gray-300 rounded-sm border-b-4"
      />
      <button
        type="submit"
        className="ml-2 text-sm text-gray-700 bg-gray-200 border-none"
      >
        Search
      </button>
      </div>
    </form>
  );
};

export default SearchBar;