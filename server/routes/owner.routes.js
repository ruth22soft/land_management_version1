import express from 'express';
import auth from '../middleware/auth.js';
import { getAllOwners, registerOwner, getOwnerProfile, updateOwnerProfile, getOwnerById, deleteOwner } from '../controllers/owner.controller.js';

/** @type {express.Router} */
const router = express.Router();

/**
 * @route GET /api/owners
 * @desc Get all landowners
 * @access Private
 */
router.get('/', auth(['admin', 'registration']), getAllOwners);

/**
 * @route GET /api/owners/:id
 * @desc Get owner by ID
 * @access Private
 */
router.get('/:id', auth(['admin', 'registration']), getOwnerById);

/**
 * @route POST /api/owners/register
 * @desc Register a new landowner
 * @access Public
 */
router.post('/register', registerOwner);

/**
 * @route GET /api/owners/profile
 * @desc Get landowner profile
 * @access Private
 */
router.get('/profile', auth(['user']), getOwnerProfile);

/**
 * @route PUT /api/owners/profile
 * @desc Update landowner profile
 * @access Private
 */
router.put('/profile', auth(['user']), updateOwnerProfile);

/**
 * @route DELETE /api/owners/:id
 * @desc Delete owner
 * @access Private
 */
router.delete('/:id', auth(['admin']), deleteOwner);

export default router;