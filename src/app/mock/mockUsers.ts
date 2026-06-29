export type UserRole = "requester" | "setup_owner" | "admin";
export type Department = "GNTC" | "MFG" | null;

export interface MockUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  password: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "u1",
    username: "requester01",
    name: "Alice Johnson",
    email: "alice@company.com",
    role: "requester",
    department: null,
    password: "password",
  },
  {
    id: "u2",
    username: "requester02",
    name: "Bob Smith",
    email: "bob@company.com",
    role: "requester",
    department: null,
    password: "password",
  },
  {
    id: "u3",
    username: "setup_gntc01",
    name: "Charlie Tan",
    email: "charlie@company.com",
    role: "setup_owner",
    department: "GNTC",
    password: "password",
  },
  {
    id: "u4",
    username: "setup_mfg01",
    name: "Diana Lee",
    email: "diana@company.com",
    role: "setup_owner",
    department: "MFG",
    password: "password",
  },
  {
    id: "u5",
    username: "admin01",
    name: "Eva Chen",
    email: "eva@company.com",
    role: "admin",
    department: null,
    password: "password",
  },
];
