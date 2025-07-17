import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// CSRF Token Handling
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

//Current user checker
export const currentUserChecker = {
  getCurrentUser: async () => {
    await getCSRF();
    return axiosInstance.get("/auth/user/", {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  }
};




//Authentication Functions
//------------------------------------------------------------------------------------------------------//

// Login
export async function login(username, password) {
  await getCSRF();
  try {
    return await axiosInstance.post(
      "/login/",
      { username, password },
      {
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      }
    );
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
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
  await getCSRF();
  try {
    return await axiosInstance.post(
      "/logout/",
      {},
      {
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      }
    );
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("An error occurred during logout.");
  }
}

// Request Password Reset
// The generic response returned from backend is designed
// so intentionally to avoid malicious account enumeration
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

// Check Authentication Status 
export async function checkAuth() {
  await getCSRF();
  return axiosInstance.get("/check-auth/", {
    headers: { "X-CSRFToken": getCookie("csrftoken") },
  });
}

//-----------------------------------------------------------------------------------------------------------//


// Timetable API Endpoints
export const timetableAPI = {
  getTimetable: async (category) => {
    await getCSRF();
    return axiosInstance.get(`timetable/${category}/`, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  updateTimetable: async (category, data) => {
    await getCSRF();
    return axiosInstance.put(`timetable/${category}/`, data, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  getSubjects: async () => {
    await getCSRF();
    return axiosInstance.get("timetable/subjects/", {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  }
};



//----------------------------------------------------------------------------------------------------------//

// Achievers API Endpoints
export const achieversAPI = {
  getAchievers: async () => 
    {
    await getCSRF();
    return axiosInstance.get('/achievers/', {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  // Get single achiever
  getAchiever: async (id) => {
    await getCSRF();
    return axiosInstance.get(`/achievers/${id}/`, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  // Create new achiever
  createAchiever: async (formData) => {
    await getCSRF();
    return axiosInstance.post('/achievers/', formData, {
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "multipart/form-data"
      }
    });
  },

  // Update achiever
  updateAchiever: async (id, formData) => {
    await getCSRF();
    return axiosInstance.put(`/achievers/${id}/`, formData, {
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "multipart/form-data"
      }
    });
  },

  // Delete achiever
  deleteAchiever: async (id) => {
    await getCSRF();
    return axiosInstance.delete(`/achievers/${id}/`, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

}

//----------------------------------------------------------------------------------------------------------//

// Showcase images API Endpoints
export const showcaseAPI = {
  getShowcaseImages: async () => {
    await getCSRF();
    return axiosInstance.get('/showcase/images/', {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  createShowcaseImage: async (formData) => {
    await getCSRF();
    return axiosInstance.post('/showcase/images/', formData, {
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
        "Content-Type": "multipart/form-data"

      }
    });
  },

  deleteShowcaseImage: async (id) => {
    await getCSRF();
    return axiosInstance.delete(`/showcase/images/${id}/`, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },
};

//----------------------------------------------------------------------------------------------------------//

//VideoShowcase API Endpoints
export const videoshowcaseAPI = {
  getVideos: async () => {
    await getCSRF();
    return axiosInstance.get('/videos/', {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  createVideo: async (formData, onUploadProgress) => {
    await getCSRF();
    return axiosInstance.post('/videos/', formData, {
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress,
    });
  },

  deleteVideo: async (id) => {
    await getCSRF();
    return axiosInstance.delete(`/videos/${id}/`, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },
  
};

//--------------------------------------------------------------------------------------------------------------//

//Announcements API

export const announcementsAPI = {
  getAnnouncements: async () => {
    await getCSRF();
    return axiosInstance.get("announcements/", {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  createAnnouncement: async (data) => {
    await getCSRF();
    return axiosInstance.post("announcements/", data, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  deleteAnnouncement: async (id) => {
    await getCSRF();
    return axiosInstance.delete(`announcements/${id}/`, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

 //this should be moved to a single currentuser endpoint
  getCurrentUser: async () => {
    await getCSRF();
    return axiosInstance.get('/auth/user/', {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },
};

//--------------------------------------------------------------------------------------------------------------//


//Gallery API
// YouTube Video API Endpoints
export const youtubeAPI = {
  getVideos: async () => {
    await getCSRF();
    return axiosInstance.get("/youtube/", {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  createVideo: async (data) => {
    await getCSRF();
    return axiosInstance.post("/youtube/", data, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },

  
  deleteVideo: async (id) => {
    await getCSRF();
    return axiosInstance.delete(`/youtube/${id}/`, {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },
  
  getCurrentUser: async () => {
    await getCSRF();
    return axiosInstance.get("/auth/user/", {
      headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
  },
};


