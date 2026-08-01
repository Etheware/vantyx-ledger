"use client";

import Link from "next/link";

const COURSES = [
  {
    slug: "backflow-basics",
    title: "Backflow Prevention Basics",
    description: "Comprehensive introduction to backflow prevention systems",
    lessons: 12,
    duration: "4 weeks",
    level: "Beginner",
  },
  {
    slug: "testing-diagnostics",
    title: "Testing & Diagnostics",
    description: "Advanced testing methodologies and diagnostic techniques",
    lessons: 8,
    duration: "3 weeks",
    level: "Intermediate",
  },
  {
    slug: "maintenance-repair",
    title: "Maintenance & Repair",
    description: "Hands-on maintenance and repair techniques",
    lessons: 10,
    duration: "3 weeks",
    level: "Intermediate",
  },
  {
    slug: "exam-preparation",
    title: "Exam Preparation",
    description: "Comprehensive exam readiness and practice tests",
    lessons: 15,
    duration: "5 weeks",
    level: "Advanced",
  },
];

export default function CoursesPage() {
  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        Course Catalog
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Browse and enroll in courses
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.5rem",
      }}>
        {COURSES.map((course) => (
          <Link key={course.slug} href={`/courses/${course.slug}`}>
            <div style={{
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor: "white",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "1.125rem" }}>
                  {course.title}
                </h3>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  {course.description}
                </p>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e5e7eb",
                fontSize: "0.875rem",
              }}>
                <div>
                  <p style={{ color: "#6b7280" }}>Lessons</p>
                  <p style={{ fontWeight: "bold" }}>{course.lessons}</p>
                </div>
                <div>
                  <p style={{ color: "#6b7280" }}>Duration</p>
                  <p style={{ fontWeight: "bold" }}>{course.duration}</p>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <p style={{
                    display: "inline-block",
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#ecfdf5",
                    color: "#065f46",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                  }}>
                    {course.level}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
