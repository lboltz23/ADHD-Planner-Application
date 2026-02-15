// src/hooks/use-Safe-Back.ts
import { useRouter } from 'expo-router';

export function useSafeBack() {
  const router = useRouter();

  return () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
}
