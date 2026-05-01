import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VisualSearch = sequelize.define('VisualSearch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  detectedTags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  resultsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('processing', 'completed', 'failed'),
    defaultValue: 'completed'
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  isRequest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

export default VisualSearch;
