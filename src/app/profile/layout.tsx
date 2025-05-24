
import React from 'react';
import { Card } from '@/components/ui/card';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="shadow-xl rounded-xl">
        {children}
      </Card>
    </div>
  );
}
