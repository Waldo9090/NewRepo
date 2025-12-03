import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
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

async function saveUsers(users: User[]) {
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

// Check if user is admin
function isAdmin(request: NextRequest): boolean {
  // In a real app, you'd validate the JWT token or session
  return true // This should be properly implemented with auth middleware
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { password, displayName, allowedCampaigns } = body

    if (!password && !displayName && !allowedCampaigns) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      )
    }

    const users = await getUsers()
    const userIndex = users.findIndex(user => user.id === id)
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user fields
    if (password) {
      users[userIndex].password = password
    }
    if (displayName !== undefined) {
      users[userIndex].displayName = displayName || undefined
    }
    if (allowedCampaigns && Array.isArray(allowedCampaigns)) {
      users[userIndex].allowedCampaigns = allowedCampaigns
    }

    await saveUsers(users)
    
    // Return user without password
    const { password: _, ...safeUser } = users[userIndex]
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: safeUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = params
    const users = await getUsers()
    
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deleting themselves
    if (users[userIndex].email === 'adimahna@gmail.com') {
      return NextResponse.json(
        { error: 'Cannot delete admin user' },
        { status: 400 }
      )
    }

    // Remove user
    users.splice(userIndex, 1)
    await saveUsers(users)
    
    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}