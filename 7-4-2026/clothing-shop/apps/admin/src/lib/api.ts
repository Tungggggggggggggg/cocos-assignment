import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  let token = session?.access_token;

  
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('local_access_token') || undefined;
  }

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
        
    }
    throw new Error(result.message || 'Có lỗi xảy ra khi gọi API Admin');
  }

  return result.data;
}
