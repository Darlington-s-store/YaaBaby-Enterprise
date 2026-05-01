import { SystemSetting } from '../models/index.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll();
    
    // Transform into a more usable format for the frontend
    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.json(config);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching system settings' });
  }
};

export const updateSetting = async (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ message: 'Key and value are required' });
  }

  try {
    const [setting, created] = await SystemSetting.upsert({
      key,
      value
    });

    res.json({ message: 'Setting updated successfully', setting });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Error updating system setting' });
  }
};

export const bulkUpdateSettings = async (req, res) => {
  const { settings } = req.body; // Array of { key, value }

  if (!Array.isArray(settings)) {
    return res.status(400).json({ message: 'Settings array is required' });
  }

  try {
    for (const item of settings) {
      await SystemSetting.upsert({
        key: item.key,
        value: item.value
      });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating system settings' });
  }
};
