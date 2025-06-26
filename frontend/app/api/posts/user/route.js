import { NextResponse } from "next/server"

// Mock database - same as other files
const posts = [
  {
    id: 1,
    title: "Welcome to Our Blog",
    content:
      "This is the first post on our amazing blog platform. We hope you enjoy reading and creating content here!",
    author: "John Doe",
    authorId: 1,
    status: "published",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: 2,
    title: "Getting Started with Next.js",
    content:
      "Next.js is a powerful React framework that makes building web applications easier. In this post, we will explore its key features.",
    author: "John Doe",
    authorId: 1,
    status: "published",
    createdAt: new Date("2024-01-20").toISOString(),
    updatedAt: new Date("2024-01-20").toISOString(),
  },
]

function getUserFromToken(token) {
  if (!token || !token.startsWith("mock-jwt-")) {
    return null
  }

  const parts = token.split("-")
  const userId = Number.parseInt(parts[2])

  return {
    id: userId,
    name: "John Doe",
    email: "john@example.com",
  }
}

// GET /api/posts/user - Get current user's posts
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    const user = getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userPosts = posts.filter((post) => post.authorId === user.id)

    return NextResponse.json({
      posts: userPosts,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
