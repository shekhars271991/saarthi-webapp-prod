import { redirect } from 'next/navigation';

export default function Home() {
  // Server-side redirect - no loading needed
  redirect('/airport-transfer');
}