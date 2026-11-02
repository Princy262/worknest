import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Team from '../models/Team.js';
import { ROLES } from '../utils/constants.js';

// username = first name (no spaces) + employeeId, e.g. "Rahul Sharma" + "123" -> "Rahul123"
const makeUsername = (name, employeeId) =>
  `${name.trim().split(/\s+/)[0]}${employeeId}`;

// ---------------------------------------------------------------
// PART 1 (always runs): create the Platform Owner
// ---------------------------------------------------------------
const createPlatformOwner = async () => {
  const existing = await User.findOne({ role: ROLES.PLATFORM_OWNER });
  if (existing) {
    console.log('Platform Owner already exists. Skipping.');
    return;
  }

  const { PLATFORM_OWNER_NAME, PLATFORM_OWNER_EMAIL, PLATFORM_OWNER_USERNAME, PLATFORM_OWNER_PASSWORD } =
    process.env;

  if (!PLATFORM_OWNER_NAME || !PLATFORM_OWNER_EMAIL || !PLATFORM_OWNER_USERNAME || !PLATFORM_OWNER_PASSWORD) {
    throw new Error('Missing PLATFORM_OWNER_* values in .env');
  }

  await User.create({
    name: PLATFORM_OWNER_NAME,
    email: PLATFORM_OWNER_EMAIL,
    username: PLATFORM_OWNER_USERNAME,
    password: PLATFORM_OWNER_PASSWORD,
    role: ROLES.PLATFORM_OWNER,
    designation: 'Platform Owner',
    mustChangePassword: false, // the owner chose this password in .env
  });

  console.log(`Platform Owner created: ${PLATFORM_OWNER_EMAIL}`);
};

// ---------------------------------------------------------------
// PART 2 (only with --sample): fake company for testing access rules
// ---------------------------------------------------------------
const createSampleData = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Sample data is for development only.');
  }

  if (await Company.findOne({ name: 'Sample Company' })) {
    console.log('Sample company already exists. Skipping sample data.');
    return;
  }

  const samplePassword = 'Sample@1234';

  // 1. Company
  const company = await Company.create({ name: 'Sample Company', domain: 'sample.com' });

  // 2. Company Head (no department, no team)
  const companyHead = await User.create({
    name: 'Chitra Head',
    email: 'companyhead@sample.com',
    employeeId: '1',
    username: makeUsername('Chitra Head', '1'),
    password: samplePassword,
    mustChangePassword: false,
    role: ROLES.COMPANY_HEAD,
    designation: 'Company Head',
    company: company._id,
  });

  // 3. Departments, each with a Department Head
  const departmentData = [
    { name: 'Social Media', headName: 'Sana Verma', employeeId: '11', email: 'social.head@sample.com' },
    { name: 'HR', headName: 'Hina Khan', employeeId: '12', email: 'hr.head@sample.com' },
    { name: 'Technology', headName: 'Tara Singh', employeeId: '13', email: 'tech.head@sample.com' },
    { name: 'Marketing', headName: 'Mohit Rao', employeeId: '14', email: 'marketing.head@sample.com' },
  ];

  const departments = {};

  for (const item of departmentData) {
    const department = await Department.create({
      name: item.name,
      company: company._id,
    });

    const head = await User.create({
      name: item.headName,
      email: item.email,
      employeeId: item.employeeId,
      username: makeUsername(item.headName, item.employeeId),
      password: samplePassword,
      mustChangePassword: false,
      role: ROLES.DEPT_HEAD,
      designation: `${item.name} Head`,
      company: company._id,
      department: department._id,
      reportingManager: companyHead._id,
    });

    department.head = head._id;
    await department.save();

    departments[item.name] = { department, head };
  }

  // 4. Technology teams (Frontend, Backend), each with a Team Manager and employees
  const tech = departments['Technology'];

  const teamData = [
    {
      name: 'Frontend',
      managerName: 'Farhan Ali',
      managerId: '21',
      managerEmail: 'frontend.manager@sample.com',
      employees: [
        { name: 'Employee A', employeeId: '101', email: 'employee.a@sample.com' },
        { name: 'Employee B', employeeId: '102', email: 'employee.b@sample.com' },
        { name: 'Employee C', employeeId: '103', email: 'employee.c@sample.com' },
      ],
    },
    {
      name: 'Backend',
      managerName: 'Bhavna Joshi',
      managerId: '22',
      managerEmail: 'backend.manager@sample.com',
      employees: [
        { name: 'Employee D', employeeId: '104', email: 'employee.d@sample.com' },
        { name: 'Employee E', employeeId: '105', email: 'employee.e@sample.com' },
        { name: 'Employee F', employeeId: '106', email: 'employee.f@sample.com' },
      ],
    },
  ];

  for (const item of teamData) {
    const team = await Team.create({
      name: item.name,
      company: company._id,
      department: tech.department._id,
    });

    const manager = await User.create({
      name: item.managerName,
      email: item.managerEmail,
      employeeId: item.managerId,
      username: makeUsername(item.managerName, item.managerId),
      password: samplePassword,
      mustChangePassword: false,
      role: ROLES.TEAM_MANAGER,
      designation: `${item.name} Manager`,
      company: company._id,
      department: tech.department._id,
      team: team._id,
      reportingManager: tech.head._id,
    });

    team.manager = manager._id;
    await team.save();

    for (const emp of item.employees) {
      await User.create({
        name: emp.name,
        email: emp.email,
        employeeId: emp.employeeId,
        username: makeUsername(emp.name, emp.employeeId),
        password: samplePassword,
        mustChangePassword: false,
        role: ROLES.EMPLOYEE,
        designation: `${item.name} Developer`,
        company: company._id,
        department: tech.department._id,
        team: team._id,
        reportingManager: manager._id,
      });
    }
  }

  console.log('Sample company created. All sample users have the password: Sample@1234');
};

// ---------------------------------------------------------------
// Run everything
// ---------------------------------------------------------------
const run = async () => {
  try {
    await connectDB();

    // Make sure the unique indexes exist before inserting data
    await Promise.all([Company.init(), User.init(), Department.init(), Team.init()]);

    await createPlatformOwner();

    if (process.argv.includes('--sample')) {
      await createSampleData();
    }

    console.log('Seeding finished.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();