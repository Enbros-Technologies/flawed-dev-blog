import { NextResponse } from "next/server"

// Mock database
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

// Mock function to extract user from token
function getUserFromToken(token) {
  if (!token || !token.startsWith("mock-jwt-")) {
    return null
  }

  const parts = token.split("-")
  const userId = Number.parseInt(parts[2])

  // Mock user data
  return {
    id: userId,
    name: "John Doe",
    email: "john@example.com",
  }
}

// GET /api/posts - Get all published posts
export async function GET() {
  try {
    // INTENTIONAL FLAW: Returns all posts including drafts and sensitive data
    const publicPosts = posts.map((post) => ({
      ...post,
      authorId: post.authorId, // Should not expose internal IDs
    }))

    return NextResponse.json({
      posts: publicPosts,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/posts - Create new post
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    // INTENTIONAL FLAW: Weak token validation
    const user = getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, content, status } = await request.json()

    const newPost = {
      id: posts.length + 1,
      title,
      content,
      author: user.name,
      authorId: user.id,
      status: status || "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    posts.push(newPost)

    return NextResponse.json({
      message: "Post created successfully",
      post: newPost,
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
