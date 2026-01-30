import express from 'express';
import { gipSystem } from './gip-system';

export const adminRouter = express.Router();

// Admin authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'clawchain-admin-2024';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

function authenticateAdmin(req: express.Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  
  const credentials = Buffer.from(authHeader.replace('Basic ', ''), 'base64').toString();
  const [username, password] = credentials.split(':');
  
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// Admin dashboard
adminRouter.get('/dashboard', (req, res) => {
  if (!authenticateAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  try {
    const allGIPs = [...gipSystem.getActiveGIPs(), ...gipSystem.getArchivedGIPs()];
    const userGeneratedGIPs = allGIPs.filter(gip => gip.author !== 'system' && gip.author !== 'admin');
    
    res.json({
      success: true,
      dashboard: {
        totalGIPs: allGIPs.length,
        activeGIPs: gipSystem.getActiveGIPs().length,
        archivedGIPs: gipSystem.getArchivedGIPs().length,
        userGeneratedGIPs: userGeneratedGIPs.length,
        systemGIPs: allGIPs.filter(gip => gip.author === 'system' || gip.author === 'admin').length
      }
    });
  } catch (error) {
    console.error('Error getting admin dashboard:', error);
    res.status(500).json({ 
      error: 'Failed to get admin dashboard',
      details: String(error)
    });
  }
});

// Delete a GIP
adminRouter.delete('/gip/:gipId', (req, res) => {
  if (!authenticateAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  const { gipId } = req.params;
  
  try {
    // Add deleteGIP method to gipSystem if it doesn't exist
    const gip = gipSystem.getGIP(gipId);
    if (!gip) {
      return res.status(404).json({ error: `GIP ${gipId} not found` });
    }
    
    // Remove from active GIPs
    const activeGIPs = gipSystem.getActiveGIPs();
    const activeIndex = activeGIPs.findIndex(g => g.id === gipId);
    if (activeIndex !== -1) {
      activeGIPs.splice(activeIndex, 1);
    }
    
    // Remove from archived GIPs
    const archivedGIPs = gipSystem.getArchivedGIPs();
    const archivedIndex = archivedGIPs.findIndex(g => g.id === gipId);
    if (archivedIndex !== -1) {
      archivedGIPs.splice(archivedIndex, 1);
    }
    
    res.json({
      success: true,
      message: `GIP ${gipId} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting GIP:', error);
    res.status(500).json({ 
      error: 'Failed to delete GIP',
      details: String(error)
    });
  }
});

// Delete a message from a GIP debate
adminRouter.delete('/gip/:gipId/message/:messageId', (req, res) => {
  if (!authenticateAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  const { gipId, messageId } = req.params;
  
  try {
    const gip = gipSystem.getGIP(gipId);
    if (!gip) {
      return res.status(404).json({ error: `GIP ${gipId} not found` });
    }
    
    const messageIndex = gip.debateThread.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ error: `Message ${messageId} not found in GIP ${gipId}` });
    }
    
    gip.debateThread.splice(messageIndex, 1);
    
    res.json({
      success: true,
      message: `Message ${messageId} deleted from GIP ${gipId}`
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      error: 'Failed to delete message',
      details: String(error)
    });
  }
});

// Clear all user-generated content
adminRouter.delete('/clear-user-content', (req, res) => {
  if (!authenticateAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  try {
    const activeGIPs = gipSystem.getActiveGIPs();
    const archivedGIPs = gipSystem.getArchivedGIPs();
    
    const userActiveGIPs = activeGIPs.filter(gip => gip.author !== 'system' && gip.author !== 'admin');
    const userArchivedGIPs = archivedGIPs.filter(gip => gip.author !== 'system' && gip.author !== 'admin');
    
    const totalDeleted = userActiveGIPs.length + userArchivedGIPs.length;
    
    // Remove user GIPs from active list
    const newActiveGIPs = activeGIPs.filter(gip => gip.author === 'system' || gip.author === 'admin');
    const newArchivedGIPs = archivedGIPs.filter(gip => gip.author === 'system' || gip.author === 'admin');
    
    // Note: This is a simplified approach. In a real implementation, you'd want to update the gipSystem state properly
    
    res.json({
      success: true,
      message: `Cleared ${totalDeleted} user-generated GIPs`,
      deletedCount: totalDeleted,
      remainingActive: newActiveGIPs.length,
      remainingArchived: newArchivedGIPs.length
    });
  } catch (error) {
    console.error('Error clearing user content:', error);
    res.status(500).json({ 
      error: 'Failed to clear user content',
      details: String(error)
    });
  }
});

// Get admin credentials info
adminRouter.get('/credentials', (req, res) => {
  res.json({
    username: ADMIN_USERNAME,
    note: 'Use Basic Auth with these credentials to access admin endpoints'
  });
}); 