import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface LeadFormProps {
    onSubmit: (formData: FormData) => Promise<void>;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSubmit }) => {
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        await onSubmit(formData);
        if (formRef.current) {
            formRef.current.reset();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Lead</CardTitle>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                            <Input id="firstName" name="firstName" placeholder="First Name" required />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                            <Input id="lastName" name="lastName" placeholder="Last Name" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <Input id="phoneNumber" name="phoneNumber" placeholder="Phone Number" required />
                    </div>
                    <div>
                        <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <Input id="emailAddress" name="emailAddress" placeholder="Email Address" />
                    </div>
                    <div>
                        <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">Property Address</label>
                        <Input id="propertyAddress" name="propertyAddress" placeholder="Property Address" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <Input id="city" name="city" placeholder="City" required />
                        </div>
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                            <Input id="state" name="state" placeholder="State" required />
                        </div>
                        <div>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                            <Input id="zipCode" name="zipCode" placeholder="Zip Code" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="isHomeOwner" className="block text-sm font-medium text-gray-700">Home Owner?</label>
                        <Select name="isHomeOwner" defaultValue="true">
                            <SelectTrigger>
                                <SelectValue placeholder="Home Owner?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="propertyValue" className="block text-sm font-medium text-gray-700">Property Value</label>
                        <Input id="propertyValue" name="propertyValue" placeholder="Property Value" type="number" required />
                    </div>
                    <div>
                        <label htmlFor="hasRealtorContract" className="block text-sm font-medium text-gray-700">Has Realtor Contract?</label>
                        <Select name="hasRealtorContract" defaultValue="true">
                            <SelectTrigger>
                                <SelectValue placeholder="Has Realtor Contract?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Number of Bedrooms</label>
                            <Input id="bedrooms" name="bedrooms" placeholder="Number of Bedrooms" type="number" />
                        </div>
                        <div>
                            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Number of Bathrooms</label>
                            <Input id="bathrooms" name="bathrooms" placeholder="Number of Bathrooms" type="number" />
                        </div>
                    </div>
                    <Button type="submit">Submit Lead</Button>
                </form>
            </CardContent>
        </Card>
    );
};