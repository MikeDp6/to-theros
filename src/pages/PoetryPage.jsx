import posts from "../data/posts";
import PostCard from "../components/PostCard";

function PoetryPage() {
  return (
    <section className="poetry-page">
      <div className="container">
        <h1>Αφιερώματα στην ποίηση</h1>

        <div className="poetry-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PoetryPage;