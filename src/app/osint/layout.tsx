import React from 'react';

export default function OsintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">OSINT Intelligence</h1>
      </div>
      {children}
    </div>
  );
} 