'use client';

import { SidebarLayout } from '@/components/SidebarLayout';

export default function TestPage() {
  return (
    <SidebarLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold">Test Page</h1>
        <p>This is a test page to verify SidebarLayout works correctly.</p>
      </div>
    </SidebarLayout>
  );
}
