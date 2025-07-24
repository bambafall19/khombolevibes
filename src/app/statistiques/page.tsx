// src/app/statistiques/page.tsx
import { redirect } from 'next/navigation';

// This page now acts as a redirect to the main statistics content page.
// This avoids any "use client" conflicts while keeping the nav link simple.
export default function StatisticsPage() {
  redirect('/statistiques/palmares');
}
