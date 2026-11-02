import mongoose from 'mongoose';
import { COMPANY_STATUS } from '../utils/constants.js';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: Object.values(COMPANY_STATUS),
      default: COMPANY_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);

export default Company;