import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Editor from '../pages/Editor';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<Editor />} />
        </Routes>
      </main>
    </div>
  );
};

export default MainLayout;