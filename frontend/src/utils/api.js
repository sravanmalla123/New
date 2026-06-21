const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('ag_token');
}

function buildHeaders(isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
}

async function request(method, path, body = null, isFormData = false) {
  const options = {
    method,
    headers: buildHeaders(isFormData),
  };
  if (body) {
    options.body = isFormData ? body : JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, options);
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned a non-JSON response');
  }

  return await res.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
  postForm: (path, formData) => request('POST', path, formData, true),
  putForm: (path, formData) => request('PUT', path, formData, true),
};

export default api;
