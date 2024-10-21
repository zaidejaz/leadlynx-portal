"use client";
import React, { useState, useEffect } from 'react';
import { updateUserRole, updateUserStatus, deleteUser, getUsers } from '@/components/super-admin1/actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { toast } from '@/hooks/use-toast';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
}

const USERS_PER_PAGE = 10;

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [roleFilter, setRoleFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, roleFilter, searchTerm]);

    const fetchUsers = async () => {
        try {
            const fetchedUsers = await getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.firstName.toLowerCase().includes(lowercasedTerm) ||
                user.lastName.toLowerCase().includes(lowercasedTerm) ||
                user.email.toLowerCase().includes(lowercasedTerm)
            );
        }

        setFilteredUsers(filtered);
        setTotalPages(Math.ceil(filtered.length / USERS_PER_PAGE));
        setCurrentPage(1);
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
                toast({
                    title: "Success",
                    description: "User deleted successfully.",
                });
            } else {
                console.error('Failed to delete user:', result.error);
                toast({
                    title: "Error",
                    description: "There was error deleting user.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };


    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * USERS_PER_PAGE,
        currentPage * USERS_PER_PAGE
    );

    return (
        <div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='flex space-x-4'>
                        <Select onValueChange={setRoleFilter} value={roleFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="realtor">Realtor</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                                <SelectItem value="qa">QA</SelectItem>
                                <SelectItem value="leadgen">Leadgen</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="text"
                            placeholder="Search by name or email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.map((user: User) => (
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

                    <div className="mt-4">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}