import { useParams } from "react-router-dom";
import posts from "../data/posts";

function Article() {
  const { id } = useParams();
  const post = posts.find(p => p.id == id);

  if (!post) return <h1>Not found</h1>;

  return (
    <div className="article">

      <div className="article-hero">
        <img src={post.image} alt="" />
        <h1>{post.title}</h1>
      </div>

      <div className="article-content">
        <p>{post.content}</p>
        <p>{post.content}</p>
        <p>{post.content}</p>
      </div>

    </div>
  );
}

export default Article;