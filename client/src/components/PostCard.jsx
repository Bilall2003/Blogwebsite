import { Link } from "react-router-dom";

function excerpt(text, max = 160) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      <h2 className="post-card-title">
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <p className="post-card-meta">
        by <strong>{post.authorName}</strong> · {formatDate(post.createdAt)}
      </p>
      <p className="post-card-excerpt">{excerpt(post.content)}</p>
      <div className="post-card-footer">
        <span>❤️ {post.likeCount}</span>
        <span>💬 {post.commentCount}</span>
        <Link to={`/posts/${post.id}`} className="read-more">
          Read more →
        </Link>
      </div>
    </article>
  );
}
