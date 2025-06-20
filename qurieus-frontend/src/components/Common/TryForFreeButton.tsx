"use client";
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AuthModal from '@/components/Auth/AuthModal';

const TryForFreeButton = () => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (session) {
    return (
      <Link href="/user/knowledge-base" className="inline-block bg-primary text-white px-6 py-3 rounded hover:bg-primary-dark transition">
        Try Qurieus with Your Own Files
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="inline-block bg-primary text-white px-6 py-3 rounded hover:bg-primary-dark transition"
      >
        Try Qurieus with Your Own Files
      </button>
      <AuthModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default TryForFreeButton; 