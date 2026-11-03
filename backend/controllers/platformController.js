import Company from '../models/Company.js';
import User from '../models/User.js';
import makeUsername from '../utils/makeUsername.js';
import { isText, isId } from '../utils/validators.js';
import { ROLES, COMPANY_STATUS, CONTACT_FIELDS } from '../utils/constants.js';

// ------------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------------
const isEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isEmployeeId = (value) => isText(value) && /^[A-Za-z0-9]+$/.test(value.trim());

// Keeps only phone / address / emergencyContact, and only if they are text.
const pickContact = (contact) => {
  const result = {};
  if (!contact || typeof contact !== 'object') return result;
  for (const field of CONTACT_FIELDS) {
    if (typeof contact[field] === 'string') result[field] = contact[field].trim();
  }
  return result;
};

// ------------------------------------------------------------------
// CREATE COMPANY + ITS COMPANY HEAD   POST /api/platform/companies
// ------------------------------------------------------------------
export const createCompany = async (req, res) => {
  const { company, head } = req.body || {};

  // 1. Check the input before touching the database
  if (!company || typeof company !== 'object' || !head || typeof head !== 'object') {
    return res.status(400).json({ message: 'Send both "company" and "head" objects' });
  }
  if (!isText(company.name)) {
    return res.status(400).json({ message: 'company.name is required' });
  }
  if (!isText(head.name) || !isEmail(head.email) || !isEmployeeId(head.employeeId) || !isText(head.password)) {
    return res.status(400).json({
      message: 'head.name, head.email, head.employeeId (letters and numbers only) and head.password are required',
    });
  }
  if (head.password.length < 8) {
    return res.status(400).json({ message: 'head.password must be at least 8 characters' });
  }

  // 2. Create the Company
  const newCompany = await Company.create({
    name: company.name.trim(),
    domain: isText(company.domain) ? company.domain.trim() : undefined,
  });

  // 3. Create its Company Head. If this fails, undo step 2 so no empty company is left.
  let newHead;
  try {
    newHead = await User.create({
      name: head.name.trim(),
      email: head.email.trim(),
      employeeId: head.employeeId.trim(),
      username: makeUsername(head.name, head.employeeId.trim()),
      password: head.password,
      mustChangePassword: true, // the head must replace the temporary password
      role: ROLES.COMPANY_HEAD,
      designation: isText(head.designation) ? head.designation.trim() : 'Company Head',
      contact: pickContact(head.contact),
      company: newCompany._id,
    });
  } catch (error) {
    await Company.deleteOne({ _id: newCompany._id });
    throw error; // the error handler turns this into a clear message
  }

  res.status(201).json({ company: newCompany, head: newHead });
};

// ------------------------------------------------------------------
// LIST COMPANIES   GET /api/platform/companies
// ------------------------------------------------------------------
export const listCompanies = async (req, res) => {
  const companies = await Company.find().sort({ name: 1 }).lean();

  // Only each company's head is looked up. No employee data is returned.
  const heads = await User.find({ role: ROLES.COMPANY_HEAD })
    .select('name email company')
    .lean();

  const headByCompany = new Map(heads.map((h) => [String(h.company), h]));

  const result = companies.map((c) => {
    const h = headByCompany.get(String(c._id));
    return {
      ...c,
      head: h ? { _id: h._id, name: h.name, email: h.email } : null,
    };
  });

  res.json({ companies: result });
};

// ------------------------------------------------------------------
// UPDATE COMPANY   PUT /api/platform/companies/:id
// (rename, change domain, activate or deactivate)
// ------------------------------------------------------------------
export const updateCompany = async (req, res) => {
  const { id } = req.params;
  if (!isId(id)) return res.status(400).json({ message: 'Invalid ID' });

  const company = await Company.findById(id);
  if (!company) return res.status(404).json({ message: 'Company not found' });

  const { name, domain, status } = req.body || {};

  if (name !== undefined) {
    if (!isText(name)) return res.status(400).json({ message: 'Invalid name' });
    company.name = name.trim();
  }
  if (domain !== undefined) {
    if (typeof domain !== 'string') return res.status(400).json({ message: 'Invalid domain' });
    company.domain = domain.trim();
  }
  if (status !== undefined) {
    if (!Object.values(COMPANY_STATUS).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    company.status = status;
  }

  await company.save();
  res.json({ company });
};