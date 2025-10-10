///generate web server
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
}

// Create a new comment
router.post('/',
    isAuthenticated,
    body('postId').notEmpty().withMessage('Post ID is required'),
    body('content').notEmpty().withMessage('Content is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { postId, content } = req.body;

        try {
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const comment = new Comment({
                post: postId,
                user: req.user._id,
                content
            });

            await comment.save();
            res.status(201).json(comment);
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Get comments for a specific post
router.get('/post/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await Comment.find({ post: postId }).populate('user', 'username').sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a comment
router.put('/:commentId',
    isAuthenticated,
    body('content').notEmpty().withMessage('Content is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { commentId } = req.params;
        const { content } = req.body;

        try {
            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            if (comment.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            comment.content = content;
            await comment.save();
            res.json(comment);
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Delete a comment
router.delete('/:commentId', isAuthenticated, async (req, res) => {
    const { commentId } = req.params;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await comment.remove();
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});