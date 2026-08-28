export type UserRole = "requester" | "setup_owner" | "admin";
export type Department = "GNTC" | "MFG" | null;

export interface MockUser {
  id: string;
  username: string; // Corporate username e.g. nxg22301 / requester01
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  employeeId?: string;
  employeeType?: string;
  title?: string;
  manager?: string;
  company?: string;
  password?: string; // Legacy fallback for login simulation
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "u1",
    username: "requester01",
    name: "Alice Johnson",
    email: "alice.johnson@nxp.com",
    role: "requester",
    department: null,
    employeeId: "NXP-10492",
    employeeType: "Employee",
    title: "Senior Product Engineer",
    manager: "Robert Vance",
    company: "NXP Semiconductors",
    password: "password",
  },
  {
    id: "u2",
    username: "requester02",
    name: "Bob Smith",
    email: "bob.smith@nxp.com",
    role: "requester",
    department: null,
    employeeId: "NXP-20391",
    employeeType: "Employee",
    title: "Wafer Test Specialist",
    manager: "Robert Vance",
    company: "NXP Semiconductors",
    password: "password",
  },
  {
    id: "u3",
    username: "setup_gntc01",
    name: "Charlie Tan",
    email: "charlie.tan@nxp.com",
    role: "setup_owner",
    department: "GNTC",
    employeeId: "NXP-30482",
    employeeType: "Employee",
    title: "GNTC Setup Lead Engineer",
    manager: "David Wright",
    company: "NXP Semiconductors",
    password: "password",
  },
  {
    id: "u4",
    username: "setup_mfg01",
    name: "Diana Lee",
    email: "diana.lee@nxp.com",
    role: "setup_owner",
    department: "MFG",
    employeeId: "NXP-40511",
    employeeType: "Employee",
    title: "MFG Probe Setup Specialist",
    manager: "Sarah Jenkins",
    company: "NXP Semiconductors",
    password: "password",
  },
  {
    id: "u5",
    username: "nxg22301",
    name: "Kasidet N.",
    email: "kasidet.n@nxp.com",
    role: "setup_owner",
    department: "GNTC",
    employeeId: "NXP-50821",
    employeeType: "Employee",
    title: "STUDENT INTERN TECHNICAL-SP",
    manager: "David Wright",
    company: "NXP Semiconductors",
    password: "password",
  },
  {
    id: "u6",
    username: "admin01",
    name: "Eva Chen",
    email: "eva.chen@nxp.com",
    role: "admin",
    department: null,
    employeeId: "NXP-00108",
    employeeType: "Employee",
    title: "Global System Administrator",
    manager: "Executive VP",
    company: "NXP Semiconductors",
    password: "password",
  },
];

// Sample Corporate Directory Mock for directory search simulation
export const MOCK_CORPORATE_DIRECTORY = [
  {
    user: "nxg22301",
    name: "Kasidet N.",
    email: "kasidet.n@nxp.com",
    employeeId: "NXP-50821",
    employeeType: "Employee",
    title: "STUDENT INTERN TECHNICAL-SP",
    manager: "David Wright",
    company: "NXP Semiconductors",
  },
  {
    user: "nxg99102",
    name: "Michael Chang",
    email: "michael.chang@nxp.com",
    employeeId: "NXP-60193",
    employeeType: "Employee",
    title: "Senior Probe Card Designer",
    manager: "David Wright",
    company: "NXP Semiconductors",
  },
  {
    user: "nxg44182",
    name: "Priya Sharma",
    email: "priya.sharma@nxp.com",
    employeeId: "NXP-70812",
    employeeType: "Employee",
    title: "Quality Assurance Engineer",
    manager: "Sarah Jenkins",
    company: "NXP Semiconductors",
  },
  {
    user: "nxg88291",
    name: "Kenji Sato",
    email: "kenji.sato@nxp.com",
    employeeId: "NXP-80941",
    employeeType: "Contractor",
    title: "Wafer Fab Yield Analyst",
    manager: "Robert Vance",
    company: "NXP Semiconductors",
  },
];
