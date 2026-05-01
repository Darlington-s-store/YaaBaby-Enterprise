import { SystemSetting } from '../models/index.js';

export const checkMaintenanceMode = async (req, res, next) => {
  try {
    const config = await SystemSetting.findOne({ where: { key: 'site_config' } });
    
    const isMaintenance = config?.value?.maintenanceMode || false;

    // Bypass if maintenance is off
    if (!isMaintenance) return next();

    // Bypass for admin routes or authenticated admins
    // We check the URL and the user role if available
    const isAdminPath = req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth/login');
    const isSettingsPath = req.path.startsWith('/api/settings'); // Need to allow admins to turn it off!
    
    // If the user is already authenticated, check if they are an admin
    const userRole = req.user?.role?.toLowerCase();
    const isAdminUser = ['admin', 'super_admin', 'manager'].includes(userRole);

    if (isAdminPath || isSettingsPath || isAdminUser) {
      return next();
    }

    // Otherwise, block the request
    res.status(503).json({
      message: 'System is currently under maintenance. Please try again later.',
      maintenance: true
    });
  } catch (error) {
    console.error('Maintenance middleware error:', error);
    next(); // Fallback to allowing request if check fails
  }
};
