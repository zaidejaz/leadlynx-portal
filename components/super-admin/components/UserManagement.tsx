"use client";
import React, { useState, useEffect } from 'react';
import { updateUserRole, updateUserStatus, addUser, deleteUser, getUsers } from '../actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface NewUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<NewUser>({
    email: '', firstName: '', lastName: '', role: '', password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await addUser(newUser);
      if (result.success) {
        setNewUser({ email: '', firstName: '', lastName: '', role: '', password: '' });
        fetchUsers();
      } else {
        console.error('Failed to add user:', result.error);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const result = await updateUserRole({ userId, role });
      if (result.success) {
        fetchUsers();
      } else {
        console.error('Failed to update user role:', result.error);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const result = await updateUserStatus({ userId, isActive: !isActive });
      if (result.success) {
        fetchUsers();
      } else {
        console.error('Failed to update user status:', result.error);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteUser({ userId });
      if (result.success) {
        fetchUsers();
      } else {
        console.error('Failed to delete user:', result.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              required
            />
            <Input
              type="text"
              placeholder="First Name"
              value={newUser.firstName}
              onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
              required
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={newUser.lastName}
              onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
              required
            />
            <Select onValueChange={(value) => setNewUser({...newUser, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="realtor">Realtor</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="leadgen">Leadgen</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>

              </SelectContent>
            </Select>
            <Input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              required
            />
            <Button type="submit">Add User</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: User) => (
            <TableRow key={user.id}>
              <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select onValueChange={(value) => handleUpdateUserRole(user.id, value)} defaultValue={user.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="realtor">Realtor</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="leadgen">Leadgen</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>

                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleUpdateUserStatus(user.id, user.isActive)}
                  variant={user.isActive ? "default" : "destructive"}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleDeleteUser(user.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}