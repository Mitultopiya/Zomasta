import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export function getApiErrorMessage(error, fallbackMessage = 'Something went wrong.') {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ERR_NETWORK' || (error?.request && !error?.response)) {
    return 'Unable to reach the server right now. Please try again in a moment.';
  }

  return error?.response?.data?.message || fallbackMessage;
}

export default api;
