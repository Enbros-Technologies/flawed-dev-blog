import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function EditPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Fetch post data on component mount
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:3001/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        setTitle(res.data.title);
        setContent(res.data.content);
    })
    .catch(err => {
        // This is where the IDOR flaw can be seen.
        // Even if the post belongs to another user, the API returns it.
        console.error("Could not fetch post, but API might have returned it anyway.", err);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        // IDOR vulnerability is triggered here if a user edits another user's post URL
        await axios.patch(`http://localhost:3001/posts/${id}`, 
            { title, content },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        router.push(`/posts/${id}`);
    } catch (err) {
        console.error("Failed to update post", err);
        alert("Failed to update post. Check console.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`http://localhost:3001/posts/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // FLAW: Bad Redirection Bug - Pushing to a page that doesn't exist.
        router.push('/post-deleted-successfully');
    } catch (err) {
        console.error("Failed to delete post", err);
        alert("Failed to delete post.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content (HTML allowed)</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="10" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <div className="flex justify-between">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Changes</button>
            {/* FLAW: UI/UX Bug - Delete button has primary action styling. */}
            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Delete Post</button>
        </div>
      </form>
    </div>
  );
}