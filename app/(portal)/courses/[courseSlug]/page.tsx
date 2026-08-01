"use client";

import Link from "next/link";

export default function CourseDetailPage({
  params,
}: {
  params: { courseSlug: string };
}) {
  const courseTitle = params.courseSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const lessons = [
    { number: 1, title: "Introduction", duration: "15 min" },
    { number: 2, title: "Core Concepts", duration: "45 min" },
    { number: 3, title: "Practice Exercise", duration: "30 min" },
  ];

  return (
    <div>
      <Link href="/courses">
        <div style={{ color: "#3b82f6", marginBottom: "1rem", cursor: "pointer" }}>
          ← Back to Courses
        </div>
      </Link>

      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        {courseTitle}
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "2rem",
        marginTop: "2rem",
      }}>
        <div>
          <div style={{
            padding: "2rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            marginBottom: "2rem",
            minHeight: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <p style={{ color: "#6b7280", textAlign: "center" }}>Course Preview</p>
          </div>

          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Course Content
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {lessons.map((lesson) => (
              <Link key={lesson.number} href={`/courses/${params.courseSlug}/lesson/${lesson.number}`}>
                <div style={{
                  padding: "1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontWeight: "bold" }}>Lesson {lesson.number}: {lesson.title}</p>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{lesson.duration}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{
            padding: "1.5rem",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            backgroundColor: "white",
          }}>
            <h3 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Course Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
              <div>
                <p style={{ color: "#6b7280" }}>Lessons</p>
                <p style={{ fontWeight: "bold" }}>12</p>
              </div>
              <div>
                <p style={{ color: "#6b7280" }}>Duration</p>
                <p style={{ fontWeight: "bold" }}>4 weeks</p>
              </div>
              <div>
                <p style={{ color: "#6b7280" }}>Level</p>
                <p style={{ fontWeight: "bold" }}>Beginner</p>
              </div>
              <button style={{
                padding: "0.75rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "500",
                cursor: "pointer",
                marginTop: "1rem",
              }}>
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
