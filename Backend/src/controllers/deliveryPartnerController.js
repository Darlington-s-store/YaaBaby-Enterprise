import { DeliveryPartner } from '../models/index.js';

export const getAllPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.findAll();
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.create(req.body);
    res.status(201).json(partner);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByPk(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    await partner.update(req.body);
    res.json(partner);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByPk(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    await partner.destroy();
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
