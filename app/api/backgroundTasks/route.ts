// app/api/backgroundTasks/route.ts
import { NextResponse } from 'next/server';
import { runBackgroundTasks } from '@/utils/backgroundTasks';

let intervalId: NodeJS.Timeout | null = null;
const INTERVAL = 60000; // Run every minute

export async function POST() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(runBackgroundTasks, INTERVAL);

  return NextResponse.json({ message: 'Background tasks started' });
}

export async function DELETE() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  return NextResponse.json({ message: 'Background tasks stopped' });
}