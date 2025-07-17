import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./pages/Home";
import NavBar from "./components/navbar/Navbar";
import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
import Logout from "./components/logout/Logout";
import RequestReset from "./components/passwordreset/RequestReset";
import ResetPassword from "./components/passwordreset/ResetPassword";
import AnnouncementCard from "./components/announcements/AnnouncementCard";
import Footer from "./components/footer/Footer";
import AdminDashboard from "./pages/AdminDashboard";
import Timetable from "./components/timetable/Timetable";
import Directions from "./components/directions/Directions";
import VideoShowcase from "./components/videos/VideoShowcase";
import About from "./components/About/About";
import GalleryComponent from "./components/gallery/Gallery";


function AppContent() {
  const location = useLocation();

  //paths to hide the navbar on
  const hiddenNavbarPaths = ["/timetable"];
  const shouldHideNavbar = hiddenNavbarPaths.includes(location.pathname);

  const hiddenFooterPaths = ["timetable"];



  return (
    <>
      {!shouldHideNavbar && <NavBar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/reset-request" element={<RequestReset />} />
        <Route path="/reset/:uid/:token" element={<ResetPassword />} />
        <Route path="/announcements" element={<AnnouncementCard />} />
        <Route path="/directions" element={<Directions />} />
        <Route path="/gallery" element={<GalleryComponent />} />
        <Route path="/videos" element={<VideoShowcase />} />
        <Route path="/about" element={<About />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route
          path="/timetable"
          element={
            <ProtectedRoute>
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;