"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, Edit, Trash2, Calendar, User } from "lucide-react"
import Link from "next/link"
import { apiRequest } from "@/lib/apiRequest"

export default function PostPage({ params }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { id: postId } = use(params)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await apiRequest(`/posts/${postId}`)
        setPost(data)
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])


  async function handleDelete(postId) {
    if (confirm("Are you sure you want to delete this post?")) {
      const token = localStorage.getItem("token")
      try {
        const result = await deletePost(postId, token)

        if (result.success) {
          toast(result.message)
          router.push("/")
        } else {
          toast(result.message)
        }
      } catch (err) {
        console.error("Error deleting post:", err)
        toast("Error deleting post")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">Loading post...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link href="/">
                  <Button className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Post Content */}
          <Card>
            <CardHeader className="pb-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={post.published === true ? "default" : "secondary"}>{post.published ? "published" : "draft"}</Badge>
                {/* INTENTIONAL FLAW: Edit/Delete buttons visible to everyone */}
                <div className="flex items-center gap-2">
                  <Link href={`/edit/${post.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <CardTitle className="text-3xl font-bold leading-tight mb-4">{post.title}</CardTitle>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {post.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>status {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                {post.updatedAt !== post.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Updated {new Date(post.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{post.content}</div>
              </div>
            </CardContent>
          </Card>

          {/* Related Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline">View All Posts</Button>
            </Link>
            <Link href="/create">
              <Button>Create New Post</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
