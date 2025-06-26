import { NextResponse } from "next/server"

// Mock database - same as posts/route.js
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

// GET /api/posts/[id] - Get single post
export async function GET(request, { params }) {
  try {
    const postId = Number.parseInt(params.id)
    const post = posts.find((p) => p.id === postId)

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    // INTENTIONAL FLAW: No proper authorization check
    const user = getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const postId = Number.parseInt(params.id)
    const postIndex = posts.findIndex((p) => p.id === postId)

    if (postIndex === -1) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // INTENTIONAL FLAW: No check if user owns the post
    const { title, content, status } = await request.json()

    posts[postIndex] = {
      ...posts[postIndex],
      title,
      content,
      status,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      message: "Post updated successfully",
      post: posts[postIndex],
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    const user = getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const postId = Number.parseInt(params.id)
    const postIndex = posts.findIndex((p) => p.id === postId)

    if (postIndex === -1) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // INTENTIONAL FLAW: No ownership check - any authenticated user can delete any post
    posts.splice(postIndex, 1)

    return NextResponse.json({
      message: "Post deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
