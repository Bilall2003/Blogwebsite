import { Router } from "express";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  listMyPosts,
  addComment,
  deleteComment,
  toggleLike,
} from "../controllers/postController.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Public reads (optionalAuth lets us mark likedByMe when logged in)
router.get("/", listPosts);
router.get("/mine/list", requireAuth, listMyPosts);
router.get("/:id", optionalAuth, getPost);

// Protected writes
router.post("/", requireAuth, createPost);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

// Comments
router.post("/:id/comments", requireAuth, addComment);
router.delete("/:id/comments/:commentId", requireAuth, deleteComment);

// Likes (toggle)
router.post("/:id/like", requireAuth, toggleLike);

export default router;
