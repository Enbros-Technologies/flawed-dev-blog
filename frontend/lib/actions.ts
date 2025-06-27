"use server"

import { revalidatePath } from "next/cache"
import { apiRequest } from "@/lib/apiRequest"

export async function deletePost(postId: string, token?: string) {
  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    await apiRequest(`/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    revalidatePath("/")

    return { success: true, message: "Post deleted successfully" }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { success: false, message: "Error deleting post" }
  }
}