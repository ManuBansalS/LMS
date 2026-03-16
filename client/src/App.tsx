import UserLogin from "./pages/UserLogin"
import UserRegister from "./pages/UserRegister"
import ProtectedRoutes from "./routes/ProtectedRoutes"
import PublicOnlyRoutes from "./routes/PublicOnlyRoutes"
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AllCoursesPage from "./pages/AllCoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import ProfilePage from "./pages/ProfilePage";

import InstructorPage from "./pages/InstructorPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import CreateQuizPage from "./pages/CreateQuizPage";


import AdminProtectedRoutes from "./routes/AdminProtectedRoutes";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInstructors from "./pages/admin/AdminInstructors";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminQuizzes from "./pages/admin/AdminQuizzes";

import { useLocation } from "react-router-dom";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const isLoggedIn = !!localStorage.getItem("token");
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar onMenuClick={() => setSidebarOpen(true)} />}
      {!isAdminRoute && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isLoggedIn={isLoggedIn} />}

      <main>
        <Routes>
          {/* ── Public-only: redirect authenticated users away ── */}
          <Route element={<PublicOnlyRoutes />}>
            <Route path="/userLogin" element={<UserLogin />} />
            <Route path="/userRegister" element={<UserRegister />} />
          </Route>

          <Route path="/" element={<HomePage />} />
          <Route path="/courses/:section" element={<AllCoursesPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />

          {/* ── Protected: requires valid token ── */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/user/profile/:id" element={<ProfilePage />} />
            <Route path="/instructor" element={<InstructorPage />} />
            <Route path="/instructor/createCourse" element={<CreateCoursePage />} />
            <Route path="/instructor/createQuiz" element={<CreateQuizPage />} />
            <Route path="/instructor/editCourse/:id" element={<CreateCoursePage />} />
            <Route path="/instructor/editQuiz/:id" element={<CreateQuizPage />} />
          </Route>

          {/* ── Admin: requires token + ADMIN role ── */}
          <Route path="/admin" element={<AdminProtectedRoutes />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="instructors" element={<AdminInstructors />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="quizzes" element={<AdminQuizzes />} />
            </Route>
          </Route>

          {/* ── Catch-all: redirect unknown paths to login ── */}
          <Route path="*" element={<Navigate to="/userLogin" replace />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
