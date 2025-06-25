import axios from 'axios';

export default function PostPage({ post }) {
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-600 mb-4">by {post.author?.email}</p>
      
      {/* FLAW: Stored XSS - Content is rendered without sanitization. */}
      <div 
        className="prose lg:prose-xl" 
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const { id } = context.params;
    const res = await axios.get(`http://localhost:3001/posts/${id}`);
    return { props: { post: res.data } };
  } catch (error) {
    return { props: { post: null } };
  }
}