import axios from 'axios';
import Link from 'next/link';

export default function HomePage({ posts }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Dev-Blog</h1>
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="p-4 border rounded shadow">
            <Link href={`/posts/${post.id}`}>
              <h2 className="text-2xl font-bold hover:text-blue-600">{post.title}</h2>
            </Link>
            <p className="text-gray-600">by {post.author?.email || 'Unknown'}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        {/* FLAW: Pagination Bug - This is hardcoded and doesn't reflect reality. */}
        <p>Page 1 of 1</p>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const res = await axios.get('http://localhost:3001/posts');
    return { props: { posts: res.data } };
  } catch (error) {
    return { props: { posts: [] } };
  }
}