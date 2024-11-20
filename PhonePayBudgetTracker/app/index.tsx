import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Redirect after ensuring the navigation stack is ready
      router.replace('/loginScreen');
    }, 0);

    return () => clearTimeout(timeout); // Clean up timeout
  }, [router]);

  return null; // Return null as the page is just for redirection
}
