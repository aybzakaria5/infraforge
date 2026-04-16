export interface User {
  id: string
  email: string
  name: string
  avatar_url: string
  role: 'admin' | 'member' | 'viewer'
  active: boolean
  last_login: string | null
  created_at: string
}

export const users: User[] = [
  {
    id: 'usr-a1b2c3d4e5f60001',
    email: 'ayoub@infraforge.dev',
    name: 'Ayoub Zakarya',
    avatar_url: 'https://avatars.githubusercontent.com/u/1001',
    role: 'admin',
    active: true,
    last_login: '2026-04-16T09:12:00Z',
    created_at: '2025-11-02T10:00:00Z',
  },
  {
    id: 'usr-a1b2c3d4e5f60002',
    email: 'sarah@infraforge.dev',
    name: 'Sarah Chen',
    avatar_url: 'https://avatars.githubusercontent.com/u/1002',
    role: 'member',
    active: true,
    last_login: '2026-04-16T08:45:00Z',
    created_at: '2025-12-10T14:30:00Z',
  },
  {
    id: 'usr-a1b2c3d4e5f60003',
    email: 'marcus@infraforge.dev',
    name: 'Marcus Johnson',
    avatar_url: 'https://avatars.githubusercontent.com/u/1003',
    role: 'member',
    active: true,
    last_login: '2026-04-15T17:22:00Z',
    created_at: '2026-01-08T09:00:00Z',
  },
  {
    id: 'usr-a1b2c3d4e5f60004',
    email: 'priya@infraforge.dev',
    name: 'Priya Sharma',
    avatar_url: 'https://avatars.githubusercontent.com/u/1004',
    role: 'viewer',
    active: true,
    last_login: '2026-04-14T11:05:00Z',
    created_at: '2026-02-20T16:00:00Z',
  },
]

export const userMap = Object.fromEntries(users.map(u => [u.id, u]))
