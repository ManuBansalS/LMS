import { createContext, useContext } from "react";
// import type { Course } from "../api";

export interface LecturerCoursesContextType {
  courses: any[];
  addCourse: (course: any) => void;
  updateCourse: (id: number, updated: any) => void;
  deleteCourse: (id: number) => void;
  getCourseById: (id: number) => any | undefined;
}

export const LecturerCoursesContext = createContext<LecturerCoursesContextType | null>(null);

export const useLecturerCourses = (): LecturerCoursesContextType => {
  const ctx = useContext(LecturerCoursesContext);
  if (!ctx) throw new Error("useLecturerCourses must be used within LecturerCoursesProvider");
  return ctx;
};

