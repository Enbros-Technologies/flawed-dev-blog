
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isDraft, setIsDraft] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const res = await axios.get('http://localhost:3001/posts', { withCredentials: true });
        setPosts(res.data);
    };

    const createPost = async () => {
        await axios.post('http://localhost:3001/posts', { title, content, isDraft }, { withCredentials: true });
        fetchPosts();
    };

    return (
        <div>
            <h1>Dev-Blog</h1>
            <div>
                <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} />
                <label><input type="checkbox" checked={isDraft} onChange={e => setIsDraft(e.target.checked)} /> Save as Draft</label>
                <button onClick={createPost}>Create</button>
            </div>
            <h2>Posts</h2>
            <ul>
                {posts.map(p => (
                    <li key={p.id}>
                        <h3 dangerouslySetInnerHTML={{ __html: p.title }} />
                        <div dangerouslySetInnerHTML={{ __html: p.content }} />
                        <button>Edit</button> {/* Always shown - bug */}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
