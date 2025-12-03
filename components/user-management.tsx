'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Check,
  Edit,
  X,
  Save
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  displayName?: string
  createdAt: string
  isActive: boolean
  allowedCampaigns: string[] // Array of campaign types: 'roger', 'reachify', 'prusa', 'unified'
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Form states
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserDisplayName, setNewUserDisplayName] = useState('')
  const [newUserCampaigns, setNewUserCampaigns] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  
  // Edit form states
  const [editPassword, setEditPassword] = useState('')
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editCampaigns, setEditCampaigns] = useState<string[]>([])
  const [showEditPassword, setShowEditPassword] = useState(false)

  const campaignOptions = [
    { id: 'roger', name: 'Roger Campaigns', description: 'Access to Roger campaign data' },
    { id: 'reachify', name: 'Reachify Campaigns', description: 'Access to Reachify campaign data' },
    { id: 'prusa', name: 'PRUSA Campaigns', description: 'Access to PRUSA campaign data' },
    { id: 'unified', name: 'Unified Campaigns', description: 'Access to unified campaign view' }
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUserEmail || !newUserPassword) {
      toast.error('Email and password are required')
      return
    }

    if (newUserCampaigns.length === 0) {
      toast.error('Please select at least one campaign access')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newUserEmail.trim(),
          password: newUserPassword,
          displayName: newUserDisplayName.trim() || undefined,
          allowedCampaigns: newUserCampaigns
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`User "${newUserEmail}" created successfully!`)
        
        // Reset form
        setNewUserEmail('')
        setNewUserPassword('')
        setNewUserDisplayName('')
        setNewUserCampaigns([])
        setShowCreateForm(false)
        
        // Refresh users list
        await fetchUsers()
      } else {
        const error = await response.json()
        toast.error(`Error creating user: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user "${email}"?`)) {
      return
    }

    setDeleting(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success(`User "${email}" deleted successfully`)
        await fetchUsers()
      } else {
        const error = await response.json()
        toast.error(`Error deleting user: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  const startEditUser = (user: User) => {
    setEditingUserId(user.id)
    setEditPassword('')
    setEditDisplayName(user.displayName || '')
    setEditCampaigns(user.allowedCampaigns || [])
    setShowEditPassword(false)
  }

  const cancelEdit = () => {
    setEditingUserId(null)
    setEditPassword('')
    setEditDisplayName('')
    setEditCampaigns([])
    setShowEditPassword(false)
  }

  const updateUser = async (userId: string) => {
    if (!editPassword && !editDisplayName && editCampaigns.length === 0) {
      toast.error('Please provide at least a new password, display name, or campaign access')
      return
    }

    if (editCampaigns.length === 0) {
      toast.error('Please select at least one campaign access')
      return
    }

    setUpdating(true)
    try {
      const updateData: any = {
        displayName: editDisplayName,
        allowedCampaigns: editCampaigns
      }
      
      if (editPassword) {
        updateData.password = editPassword
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('User updated successfully!')
        setEditingUserId(null)
        await fetchUsers()
      } else {
        const error = await response.json()
        toast.error(`Error updating user: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        <span className="ml-2 text-slate-600">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-600 mt-1">Manage user accounts and access</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New User</h3>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={newUserDisplayName}
                    onChange={(e) => setNewUserDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10 pr-10"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Campaign Access */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Campaign Access * <span className="text-xs text-slate-500">(Select which campaigns this user can access)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {campaignOptions.map((campaign) => (
                  <div key={campaign.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                    <Checkbox
                      checked={newUserCampaigns.includes(campaign.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewUserCampaigns([...newUserCampaigns, campaign.id])
                        } else {
                          setNewUserCampaigns(newUserCampaigns.filter(id => id !== campaign.id))
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{campaign.name}</div>
                      <div className="text-xs text-slate-500">{campaign.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              {newUserCampaigns.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Please select at least one campaign</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={creating}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewUserEmail('')
                  setNewUserPassword('')
                  setNewUserDisplayName('')
                  setNewUserCampaigns([])
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Users ({users.length})</h3>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No users found</h3>
            <p className="text-slate-600 mb-4">Create your first user to get started</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Email</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Display Name</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Campaign Access</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Password/Created</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {editingUserId === user.id ? (
                      // Edit mode row
                      <>
                        <td className="py-4 px-2">
                          <div className="font-medium text-slate-800 text-sm">{user.email}</div>
                          <div className="text-xs text-slate-500">Cannot edit email</div>
                        </td>
                        <td className="py-4 px-2">
                          <Input
                            type="text"
                            value={editDisplayName}
                            onChange={(e) => setEditDisplayName(e.target.value)}
                            placeholder="Display Name"
                            className="text-sm h-8"
                          />
                        </td>
                        <td className="py-4 px-2">
                          <div className="space-y-2">
                            {campaignOptions.map((campaign) => (
                              <label key={campaign.id} className="flex items-center space-x-2 text-xs">
                                <Checkbox
                                  checked={editCampaigns.includes(campaign.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setEditCampaigns([...editCampaigns, campaign.id])
                                    } else {
                                      setEditCampaigns(editCampaigns.filter(id => id !== campaign.id))
                                    }
                                  }}
                                />
                                <span className="capitalize">{campaign.id}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="relative">
                            <Input
                              type={showEditPassword ? 'text' : 'password'}
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              placeholder="New password (optional)"
                              className="text-sm h-8 pr-8"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEditPassword(!showEditPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showEditPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateUser(user.id)}
                              disabled={updating}
                              className="bg-green-600 hover:bg-green-700 text-white h-7 px-2"
                            >
                              {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="h-7 px-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View mode row
                      <>
                        <td className="py-4 px-2">
                          <div className="font-medium text-slate-800 text-sm">{user.email}</div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="text-sm text-slate-600">
                            {user.displayName || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex flex-wrap gap-1">
                            {(user.allowedCampaigns || []).map((campaign) => (
                              <span key={campaign} className={`text-xs px-2 py-1 rounded-full capitalize ${
                                campaign === 'roger' ? 'bg-blue-100 text-blue-800' :
                                campaign === 'reachify' ? 'bg-green-100 text-green-800' :
                                campaign === 'prusa' ? 'bg-purple-100 text-purple-800' :
                                'bg-indigo-100 text-indigo-800'
                              }`}>
                                {campaign}
                              </span>
                            ))}
                            {(!user.allowedCampaigns || user.allowedCampaigns.length === 0) && (
                              <span className="text-xs text-slate-500">No access</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="text-sm text-slate-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditUser(user)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 h-7 px-2"
                              disabled={user.email === 'adimahna@gmail.com'} // Prevent admin from editing themselves
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteUser(user.id, user.email)}
                              disabled={user.email === 'adimahna@gmail.com' || deleting === user.id} // Prevent admin from deleting themselves
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-7 px-2"
                            >
                              {deleting === user.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Admin Notice */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800 mb-1">Admin Access</h4>
            <p className="text-sm text-amber-700">
              This user management interface is only available to administrators (adimahna@gmail.com). 
              Created users will have access to view campaign data but cannot manage other users.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}