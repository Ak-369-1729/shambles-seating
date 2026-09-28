import fs from "fs";
import path from "path";

export interface DevUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  collegeId: string;
  role: "participant" | "admin";
  createdAt: string;
}

// In-memory cache for ultra-fast lookup
const memoryUsers = new Map<string, DevUser>();

// Seed default accounts
const SEED_USERS: DevUser[] = [
  {
    id: "dev-user-participant-1",
    email: "captain@grandline.edu",
    password: "Password123!",
    fullName: "Captain Monkey D. Luffy",
    collegeId: "COL-2026-001",
    role: "participant",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dev-user-admin-1",
    email: "admiral@reverie.gov",
    password: "Password123!",
    fullName: "Fleet Admiral Sakazuki",
    collegeId: "ADM-2026-999",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
];

SEED_USERS.forEach((u) => memoryUsers.set(u.email.toLowerCase(), u));

const filePath = path.join(process.cwd(), "scratch", "dev-auth-users.json");

function loadUsers(): Map<string, DevUser> {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const data: DevUser[] = JSON.parse(content);
      data.forEach((u: DevUser) => memoryUsers.set(u.email.toLowerCase(), u));
    }
  } catch {
    // Ignore read errors
  }
  return memoryUsers;
}

function saveUsers() {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const arr = Array.from(memoryUsers.values());
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), "utf-8");
  } catch {
    // Ignore write errors
  }
}

// Initial load
loadUsers();

export function saveDevUser(user: DevUser) {
  loadUsers();
  memoryUsers.set(user.email.toLowerCase(), user);
  saveUsers();
}

export function getDevUser(email: string): DevUser | undefined {
  loadUsers();
  return memoryUsers.get(email.toLowerCase());
}
