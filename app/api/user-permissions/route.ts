import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface User {
  id: string
  email: string
  password: string
  displayName?: string
  createdAt: string
  isActive: boolean
  allowedCampaigns: string[]
}

const USERS_FILE = join(process.cwd(), 'data', 'users.json')

async function getUsers(): Promise<User[]> {
  if (!existsSync(USERS_FILE)) {
    return []
  }
  
  const content = await readFile(USERS_FILE, 'utf-8')
  return JSON.parse(content)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const users = await getUsers()
    
    // Find user by email and password (in production, use proper auth with hashed passwords)
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password &&
      u.isActive
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Return user permissions without password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      isAdmin: user.email === 'adimahna@gmail.com',
      allowedCampaigns: user.allowedCampaigns
    })
  } catch (error) {
    console.error('Error checking user permissions:', error)
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    )
  }
}