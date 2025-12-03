import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { randomUUID } from 'crypto'

interface User {
  id: string
  email: string
  password: string
  displayName?: string
  createdAt: string
  isActive: boolean
  allowedCampaigns: string[]
}

// Simple file-based user storage for demo purposes
// In production, use a proper database
const USERS_FILE = join(process.cwd(), 'data', 'users.json')

async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
}

async function getUsers(): Promise<User[]> {
  await ensureDataDir()
  
  if (!existsSync(USERS_FILE)) {
    // Create initial admin user
    const initialUsers: User[] = [
      {
        id: randomUUID(),
        email: 'adimahna@gmail.com',
        password: 'admin123', // In production, hash this
        displayName: 'Admin User',
        createdAt: new Date().toISOString(),
        isActive: true,
        allowedCampaigns: ['roger', 'reachify', 'prusa', 'unified'] // Admin has access to all
      }
    ]
    await writeFile(USERS_FILE, JSON.stringify(initialUsers, null, 2))
    return initialUsers
  }
  
  const content = await readFile(USERS_FILE, 'utf-8')
  return JSON.parse(content)
}

async function saveUsers(users: User[]) {
  await ensureDataDir()
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

// Check if user is admin
function isAdmin(request: NextRequest): boolean {
  // In a real app, you'd validate the JWT token or session
  // For demo purposes, we'll assume the admin user is making the request
  return true // This should be properly implemented with auth middleware
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const users = await getUsers()
    
    // Don't return passwords
    const safeUsers = users.map(({ password, ...user }) => user)
    
    return NextResponse.json({ users: safeUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, displayName, allowedCampaigns } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!allowedCampaigns || allowedCampaigns.length === 0) {
      return NextResponse.json(
        { error: 'At least one campaign access is required' },
        { status: 400 }
      )
    }

    const users = await getUsers()
    
    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser: User = {
      id: randomUUID(),
      email: email.toLowerCase(),
      password: password, // In production, hash this with bcrypt
      displayName: displayName || undefined,
      createdAt: new Date().toISOString(),
      isActive: true,
      allowedCampaigns: allowedCampaigns
    }

    users.push(newUser)
    await saveUsers(users)

    // Return user without password
    const { password: _, ...safeUser } = newUser
    
    return NextResponse.json({
      success: true,
      user: safeUser
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}