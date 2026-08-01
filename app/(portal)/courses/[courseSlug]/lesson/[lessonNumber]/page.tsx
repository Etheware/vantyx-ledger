"use client";

import Link from "next/link";

export default function LessonPage({
  params,
}: {
  params: { courseSlug: string; lessonNumber: string };
}) {
  const lessonTitle = `Lesson ${params.lessonNumber}: Core Concepts`;

  return (
    <div>
      <Link href={`/courses/${params.courseSlug}`}>
        <div style={{ color: "#3b82f6", marginBottom: "1rem", cursor: "pointer" }}>
          ← Back to Course
        </div>
      </Link>

      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        {lessonTitle}
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "3fr 1fr",
        gap: "2rem",
      }}>
        <div>
          <div style={{
            padding: "2rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            marginBottom: "2rem",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <p style={{ color: "#6b7280", textAlign: "center" }}>Lesson Content Video/Materials</p>
          </div>

          <div style={{
            padding: "1.5rem",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            backgroundColor: "white",
          }}>
            <h2 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Lesson Summary</h2>
            <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
              This lesson covers the essential concepts and theories behind backflow prevention.
              You will learn about pressure dynamics, valve operation, and real-world applications.
            </p>
          </div>
        </div>

        <div>
          <div style={{
            padding: "1.5rem",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            backgroundColor: "white",
            position: "sticky",
            top: "1rem",
          }}>
            <h3 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Lesson Progress</h3>
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e5e7eb",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "1rem",
            }}>
              <div style={{
                height: "100%",
                width: "60%",
                backgroundColor: "#3b82f6",
              }} />
            </div>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>60% complete</p>

            <button style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "500",
              cursor: "pointer",
              marginBottom: "0.5rem",
            }}>
              Mark Complete
            </button>

            <Link href={`/courses/${params.courseSlug}/lesson/${parseInt(params.lessonNumber) + 1}`}>
              <button style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#f3f4f6",
                color: "#1f2937",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                fontWeight: "500",
                cursor: "pointer",
              }}>
                Next Lesson
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
