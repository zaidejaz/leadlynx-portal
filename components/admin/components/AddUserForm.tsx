import { addUser } from "@/components/super-admin1/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react";
import { toast } from "@/hooks/use-toast"

interface NewUser {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    password: string;
}


const AddUserForm = () => {
    const [newUser, setNewUser] = useState<NewUser>({
        email: '', firstName: '', lastName: '', role: '', password: ''
    });

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await addUser(newUser);
            if (result.success) {
                setNewUser({ email: '', firstName: '', lastName: '', role: '', password: '' });
                toast({
                    title: "Success",
                    description: "User created successfully.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "There was error creating new user.",
                    variant: "destructive",
                });
                console.error('Failed to add user:', result.error);
            }
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    return (
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
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                    />
                    <Input
                        type="text"
                        placeholder="First Name"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        required
                    />
                    <Input
                        type="text"
                        placeholder="Last Name"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        required
                    />
                    <Select onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
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
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                    />
                    <Button type="submit">Add User</Button>
                </form>
            </CardContent>
        </Card>)
}

export default AddUserForm