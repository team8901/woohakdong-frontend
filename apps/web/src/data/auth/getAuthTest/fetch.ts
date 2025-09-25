import { API_URL } from '@/data/apiUrl';
import { api } from '@workspace/api/axios';

export const getAuthTest = async () => {
  const { data } = await api.get(API_URL.AUTH.TEST);

  return data;
};
