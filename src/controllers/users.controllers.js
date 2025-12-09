import logger from '#config/logger';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service';
import { userIdSchema, updateUserSchema } from '#validations/users.validation';
import { formatValidationError } from '#utils/format';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users..');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    logger.info(`Getting user with id: ${id}`);

    const user = await getUserByIdService(parseInt(id));

    res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by id:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = paramsValidation.data;
    const updates = bodyValidation.data;

    // TODO: Get authenticated user from req.user once auth middleware is implemented
    const authenticatedUserId = req.user?.id;
    const authenticatedUserRole = req.user?.role || 'guest';

    // Check if user is trying to update their own information
    const isOwnProfile =
      authenticatedUserId && authenticatedUserId === parseInt(id);

    // Only authenticated users can update their own information
    if (!isOwnProfile && authenticatedUserRole !== 'admin') {
      logger.warn(
        `Unauthorized update attempt: User ${authenticatedUserId} tried to update user ${id}`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admins can change role
    if (updates.role && authenticatedUserRole !== 'admin') {
      logger.warn(
        `Unauthorized role change attempt by user ${authenticatedUserId}`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can change user roles',
      });
    }

    logger.info(`Updating user with id: ${id}`);

    const updatedUser = await updateUserService(parseInt(id), updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    // TODO: Get authenticated user from req.user once auth middleware is implemented
    const authenticatedUserId = req.user?.id;
    const authenticatedUserRole = req.user?.role || 'guest';

    // Check if user is trying to delete their own account or is an admin
    const isOwnProfile =
      authenticatedUserId && authenticatedUserId === parseInt(id);

    if (!isOwnProfile && authenticatedUserRole !== 'admin') {
      logger.warn(
        `Unauthorized delete attempt: User ${authenticatedUserId} tried to delete user ${id}`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account or must be an admin',
      });
    }

    logger.info(`Deleting user with id: ${id}`);

    await deleteUserService(parseInt(id));

    res.json({
      message: 'User deleted successfully',
    });
  } catch (e) {
    logger.error('Error deleting user:', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};
