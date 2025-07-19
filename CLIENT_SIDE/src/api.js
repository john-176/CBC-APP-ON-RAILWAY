import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // No refresh token available, logout the user
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Attempt to refresh the token
        const response = await axios.post(
          `${BASE_URL}/token/refresh/`,
          { refresh: refreshToken }
        );
        
        const { access } = response.data;
        localStorage.setItem("access_token", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout the user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// CSRF Token Handling (still needed for non-JWT endpoints)
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, val] = cookie.split("=");
    if (key === name) return val;
  }
  return null;
}

// Get CSRF Token 
export async function getCSRF() {
  await axiosInstance.get("/csrf/");
}

// Authentication Functions
//------------------------------------------------------------------------------------------------------//

// Login with JWT
export async function login(username, password) {
  try {
    const response = await axiosInstance.post(
      "/token/",
      { username, password }
    );
    
    const { access, refresh } = response.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    
    // Also get user details
    const userResponse = await getCurrentUser();
    return { tokens: response.data, user: userResponse.data };
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    } else if (error.message) {
      throw new Error("Network or server error: " + error.message);
    } else {
      throw new Error("An unknown error occurred during login.");
    }
  }
}

// Signup
export async function signup(username, password, password2) {
  await getCSRF();
  try {
    const response = await axiosInstance.post(
      "/signup/",
      { username, password, password2 },
      {
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      const messages = Object.values(error.response.data).flat().join(" ");
      throw new Error(messages || "Signup failed.");
    } else {
      throw new Error("An error occurred during signup.");
    }
  }
}

// Logout 
export async function logout() {
  try {
    // Clear local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    
    // Optionally call backend logout if needed
    await getCSRF();
    await axiosInstance.post(
      "/logout/",
      {},
      {
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    // Even if backend logout fails, clear tokens locally
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

//Current user checker
export const getCurrentUser = async () => {
  return axiosInstance.get("/auth/user/");
};

// Check Authentication Status 
export async function checkAuth() {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return { isAuthenticated: false };
    
    // Verify token is still valid
    const response = await getCurrentUser();
    return { isAuthenticated: true, user: response.data };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

// Request Password Reset
export async function requestPasswordReset(email) {
  await getCSRF();
  return axiosInstance.post(
    "/password-reset/",
    { email },
    {
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    }
  );
}

// Confirm Password Reset
export async function confirmPasswordReset(uid, token, password) {
  await getCSRF();
  return axiosInstance.post(
    `/password-reset-confirm/${uid}/${token}/`,
    { password },
    {
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    }
  );
}

// ... rest of your API endpoints remain the same ...


