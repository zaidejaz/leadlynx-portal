import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notification } from '../types';

interface NotificationListProps {
    notifications: Notification[];
}

export const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
                {notifications.length > 0 ? (
                    <ul className="space-y-2">
                        {notifications.map((notification) => (
                            <li key={notification.id} className="bg-white p-4 rounded shadow">
                                <p>{notification.message}</p>
                                <small className="text-gray-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </small>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No new notifications.</p>
                )}
            </CardContent>
        </Card>
    );
};