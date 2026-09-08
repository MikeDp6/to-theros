import { useState } from "react";

function HistoryFeature({ posts }) {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((index - 1 + posts.length) % posts.length);
  };

  const next = () => {
    setIndex((index + 1) % posts.length);
  };

  const post = posts[index];

  return (
    <section className="history reveal" id="history">
      <div className="container">
        <h2 className="stagger">Ιστορία</h2>

        <div className="history-wrapper">

          {/* IMAGE */}
          <div className="history-image stagger">
            <img src={post.image} alt={post.title} />

            <button className="history-arrow left" onClick={prev}>←</button>
            <button className="history-arrow right" onClick={next}>→</button>
          </div>

          {/* TEXT */}
          <div className="history-content stagger">
            <h3>{post.title}</h3>
            <p>{post.description}</p>
          </div>

        </div>

        <div className="history-footer stagger">
          <a href="/history" className="see-all">Δες τα όλα</a>
        </div>

      </div>
    </section>
  );
}

export default HistoryFeature;