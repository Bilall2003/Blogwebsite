import pool from "../config/db.js";

// Shared SELECT that enriches a post with author name and aggregate counts.
const POST_SELECT = `
  SELECT
    p.id,
    p.title,
    p.content,
    p.author_id        AS authorId,
    u.user_username    AS authorName,
    p.created_at       AS createdAt,
    p.updated_at       AS updatedAt,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id)    AS likeCount,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS commentCount
  FROM posts p
  JOIN user u ON u.user_id = p.author_id
`;

export async function listPosts(req, res, next) {
  try {
    const [rows] = await pool.query(`${POST_SELECT} ORDER BY p.created_at DESC`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getPost(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`${POST_SELECT} WHERE p.id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    const post = rows[0];

    const [comments] = await pool.query(
      `SELECT c.id, c.comment_text AS text, c.created_at AS createdAt,
              c.user_id AS userId, u.user_username AS username
         FROM comments c
         JOIN user u ON u.user_id = c.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC`,
      [id]
    );

    let likedByMe = false;
    if (req.user) {
      const [liked] = await pool.query(
        "SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?",
        [id, req.user.id]
      );
      likedByMe = liked.length > 0;
    }

    res.json({ ...post, comments, likedByMe });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req, res, next) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }

    const [result] = await pool.query(
      "INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)",
      [title, content, req.user.id]
    );

    const [rows] = await pool.query(`${POST_SELECT} WHERE p.id = ?`, [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const [rows] = await pool.query(
      "SELECT author_id FROM posts WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }
    if (rows[0].author_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only edit your own posts." });
    }
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    }

    await pool.query("UPDATE posts SET title = ?, content = ? WHERE id = ?", [
      title,
      content,
      id,
    ]);

    const [updated] = await pool.query(`${POST_SELECT} WHERE p.id = ?`, [id]);
    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT author_id FROM posts WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }
    if (rows[0].author_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts." });
    }

    await pool.query("DELETE FROM posts WHERE id = ?", [id]);
    res.json({ message: "Post deleted." });
  } catch (err) {
    next(err);
  }
}

export async function listMyPosts(req, res, next) {
  try {
    const [rows] = await pool.query(
      `${POST_SELECT} WHERE p.author_id = ? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
export async function addComment(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required." });
    }

    const [post] = await pool.query("SELECT id FROM posts WHERE id = ?", [id]);
    if (post.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    const [result] = await pool.query(
      "INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)",
      [id, req.user.id, text.trim()]
    );

    const [rows] = await pool.query(
      `SELECT c.id, c.comment_text AS text, c.created_at AS createdAt,
              c.user_id AS userId, u.user_username AS username
         FROM comments c
         JOIN user u ON u.user_id = c.user_id
        WHERE c.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const [rows] = await pool.query(
      "SELECT user_id FROM comments WHERE id = ?",
      [commentId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Comment not found." });
    }
    if (rows[0].user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments." });
    }

    await pool.query("DELETE FROM comments WHERE id = ?", [commentId]);
    res.json({ message: "Comment deleted." });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Likes (toggle)
// ---------------------------------------------------------------------------
export async function toggleLike(req, res, next) {
  try {
    const { id } = req.params;
    const [post] = await pool.query("SELECT id FROM posts WHERE id = ?", [id]);
    if (post.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    const [existing] = await pool.query(
      "SELECT like_id FROM likes WHERE post_id = ? AND user_id = ?",
      [id, req.user.id]
    );

    let liked;
    if (existing.length > 0) {
      await pool.query("DELETE FROM likes WHERE like_id = ?", [
        existing[0].like_id,
      ]);
      liked = false;
    } else {
      await pool.query(
        "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
        [id, req.user.id]
      );
      liked = true;
    }

    const [count] = await pool.query(
      "SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ?",
      [id]
    );
    res.json({ liked, likeCount: count[0].likeCount });
  } catch (err) {
    next(err);
  }
}
