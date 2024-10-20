import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RealtorUpdateDialog } from './RealtorUpdateDialog';
import { Realtor } from '../types';

interface RealtorTableProps {
    realtors: Realtor[];
    handleUpdateRealtorInfo: (realtorId: string, field: string, value: boolean | string) => Promise<void>;
}

export const RealtorTable: React.FC<RealtorTableProps> = ({ realtors, handleUpdateRealtorInfo }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Realtor Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Agent Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Brokerage</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Central Zip-code</TableHead>
                            <TableHead>Radius</TableHead>
                            <TableHead>Sign-up Category</TableHead>
                            <TableHead>Zip-codes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Contact Signed</TableHead>
                            <TableHead>Contract Sent</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {realtors.map((realtor) => (
                            <TableRow key={realtor.id}>
                                <TableCell>{realtor.agentCode}</TableCell>
                                <TableCell>{`${realtor.firstName} ${realtor.lastName}`}</TableCell>
                                <TableCell>{realtor.phoneNumber}</TableCell>
                                <TableCell>{realtor.email}</TableCell>
                                <TableCell>{realtor.brokerage}</TableCell>
                                <TableCell>{realtor.state}</TableCell>
                                <TableCell>{realtor.centralZipCode}</TableCell>
                                <TableCell>{realtor.radius}</TableCell>
                                <TableCell>{realtor.signUpCategory}</TableCell>
                                <TableCell>
                                    {realtor.zipCodes.length}
                                    {realtor.zipCodes.length < 50 && (
                                        <span className="text-red-500 ml-2">Zip-codes are less than 50</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className={realtor.isActive ? 'bg-green-500 px-2 py-1 rounded text-white': 'bg-red-500 px-2 py-1 rounded text-white'}>
                                        {realtor.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell>{realtor.contactSigned ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{realtor.contractSent ? 'Yes' : 'No'}</TableCell>
                                <TableCell>
                                    <RealtorUpdateDialog
                                        realtor={realtor}
                                        handleUpdateRealtorInfo={handleUpdateRealtorInfo}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};