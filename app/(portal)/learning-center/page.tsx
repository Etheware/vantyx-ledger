"use client";

import Link from "next/link";

const COURSES = [
  {
    slug: "backflow-basics",
    title: "Backflow Prevention Basics",
    description: "Master the fundamentals of backflow prevention",
    lessons: 12,
    progress: 0,
  },
  {
    slug: "testing-diagnostics",
    title: "Testing & Diagnostics",
    description: "Learn advanced testing methodologies",
    lessons: 8,
    progress: 0,
  },
  {
    slug: "maintenance-repair",
    title: "Maintenance & Repair",
    description: "Hands-on maintenance and repair techniques",
    lessons: 10,
    progress: 0,
  },
  {
    slug: "exam-preparation",
    title: "Exam Preparation",
    description: "Comprehensive exam readiness program",
    lessons: 15,
    progress: 0,
  },
];

export default function LearningCenterPage() {
  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        Learning Center
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Choose a course to get started on your learning journey
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
              transition: "all 0.2s",
            }}>
              <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                {course.title}
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {course.description}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span>{course.lessons} lessons</span>
                <span>{course.progress}% complete</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile shortcuts */}
      <div style={{
        marginTop: "3rem",
        padding: "1.5rem",
        backgroundColor: "#f3f4f6",
        borderRadius: "8px",
        display: "none",
      }} className="mobile-shortcuts">
        <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>Quick Access</p>
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
          {COURSES.map((course) => (
            <Link key={course.slug} href={`/courses/${course.slug}`} style={{
              padding: "0.75rem 1rem",
              backgroundColor: "white",
              borderRadius: "4px",
              whiteSpace: "nowrap",
              textDecoration: "none",
              color: "inherit",
              fontSize: "0.875rem",
            }}>
              {course.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}