import { Link } from "react-router-dom";
import { useRef } from "react";

function PostCard({ post, isFocused = false }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * -6;
    const magneticX = ((x - centerX) / centerX) * 8;
    const magneticY = ((y - centerY) / centerY) * 6;

    // tilt
    card.style.setProperty("--rotateX", `${rotateX}deg`);
    card.style.setProperty("--rotateY", `${rotateY}deg`);
    card.style.setProperty("--magneticX", `${magneticX}px`);
    card.style.setProperty("--magneticY", `${magneticY}px`);

    // glow follow
    card.style.setProperty("--mouseX", `${x}px`);
    card.style.setProperty("--mouseY", `${y}px`);
  };

  const reset = () => {
    const card = cardRef.current;
    card.style.setProperty("--rotateX", `0deg`);
    card.style.setProperty("--rotateY", `0deg`);
    card.style.setProperty("--magneticX", `0px`);
    card.style.setProperty("--magneticY", `0px`);
  };

  return (
    <Link
      to={`/post/${post.id}`}
      className="card cinematic-card"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
    >
      <div className="image-wrapper">
        <img src={post.image} alt="" className="parallax-img" />
      </div>

      <div className="card-copy">
        {isFocused ? <span className="card-kicker">Featured now</span> : null}
        <h3>{post.title}</h3>
        <p>{post.content}</p>
      </div>
    </Link>
  );
}

export default PostCard;
