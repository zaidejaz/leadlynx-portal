// utils/startBackgroundTasks.ts

export async function startBackgroundTasks() {
    try {
      const response = await fetch('/api/backgroundTasks', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to start background tasks');
      }
      console.log('Background tasks started');
    } catch (error) {
      console.error('Error starting background tasks:', error);
    }
  }