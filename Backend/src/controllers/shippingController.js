import { ShippingZone, ShippingMethod } from '../models/index.js';

export const getShippingZones = async (req, res) => {
  try {
    const zones = await ShippingZone.findAll({
      include: [{ model: ShippingMethod, as: 'methods' }]
    });
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShippingZone = async (req, res) => {
  try {
    const { name, regions, enabled } = req.body;
    const zone = await ShippingZone.create({ name, regions, enabled });
    res.status(201).json(zone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createShippingMethod = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const method = await ShippingMethod.create({
      ...req.body,
      zoneId
    });
    res.status(201).json(method);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShippingZone = async (req, res) => {
  try {
    await ShippingZone.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Shipping zone deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
