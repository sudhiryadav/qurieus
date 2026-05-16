"use client";
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AuthModal from '@/components/Auth/AuthModal';
import { Button } from '@/components/ui/button';

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
      <Button asChild size="lg">
        <Link href="/user/knowledge-base">Try Qurieus with Your Own Files</Link>
      </Button>
    );
  }

  return (
    <>
      <Button size="lg" onClick={handleOpenModal}>
        Try Qurieus with Your Own Files
      </Button>
      <AuthModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default TryForFreeButton; 