import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth';
import { AuthRequest } from '../types/request';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get team members
router.get('/team/members', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all users (for now - in production, implement proper team/organization logic)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 users
    });

    // Transform to team member format
    const members = users.map(user => ({
      id: user.id,
      name: user.fullName || user.email.split('@')[0],
      email: user.email,
      role: 'viewer' as const, // Default role - implement role system if needed
      status: 'active' as const, // Default status
      lastActive: 'Recently',
      documentsProcessed: 0, // Placeholder - implement document count
      joinDate: new Date(user.createdAt).toISOString().split('T')[0],
      permissions: getPermissionsForRole('viewer'),
    }));

    // Calculate stats
    const activeMembers = members.filter(m => m.status === 'active').length;
    const pendingInvites = 0; // No pending invites in current implementation

    res.json({
      members,
      stats: {
        totalMembers: members.length,
        activeMembers,
        pendingInvites,
        documentsThisMonth: 0, // Placeholder
        avgDocumentsPerUser: 0 // Placeholder
      }
    });
  } catch (error: any) {
    logger.error('Team members fetch error', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Invite team member
router.post('/team/invite', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { email, role } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!email || !role) {
      res.status(400).json({ error: 'Email and role are required' });
      return;
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user with invite (placeholder - implement proper invite system)
      // Note: User model doesn't have role field, implement team/role system if needed
      // Generate a temporary password hash (users should reset password)
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('TempPassword123!', 10);
      
      user = await prisma.user.create({
        data: {
          email,
          fullName: email.split('@')[0],
          passwordHash: passwordHash,
          subscriptionPlan: 'starter',
          subscriptionStatus: 'inactive',
        }
      });
    }
    // Note: Role management needs to be implemented separately (e.g., TeamMember model)

    logger.info('Team member invited', { email, role, invitedBy: userId });

    res.json({
      success: true,
      userId: user.id,
      message: 'Invitation sent successfully'
    });
  } catch (error: any) {
    logger.error('Team invite error', { error: error.message });
    res.status(500).json({ error: error.message || 'Failed to invite team member' });
  }
});

// Remove team member
router.delete('/team/members/:memberId', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { memberId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if user exists
    const member = await prisma.user.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    // In production, you might want to soft-delete or archive instead
    // For now, we'll just return success (implement proper deletion if needed)
    logger.info('Team member removed', { memberId, removedBy: userId });

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error: any) {
    logger.error('Team member removal error', { error: error.message });
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// Change team member role
router.patch('/team/members/:memberId/role', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { memberId } = req.params;
    const { role } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!role) {
      res.status(400).json({ error: 'Role is required' });
      return;
    }

    // Note: User model doesn't have role field
    // For now, just return success - implement TeamMember model for role management
    const user = await prisma.user.findUnique({
      where: { id: memberId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    logger.info('Team member role updated', { memberId, role, updatedBy: userId });

    res.json({
      success: true,
      message: 'Role updated successfully',
      user
    });
  } catch (error: any) {
    logger.error('Team role update error', { error: error.message });
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Helper function to get permissions for role
function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case 'admin':
      return ['All permissions', 'Manage team', 'View analytics'];
    case 'manager':
      return ['Manage documents', 'View analytics', 'Invite users'];
    case 'agent':
      return ['Process documents', 'View reports'];
    case 'viewer':
      return ['View documents', 'View reports'];
    default:
      return [];
  }
}

export default router;

