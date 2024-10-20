import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Lead } from '../types';

interface LeadDetailsProps {
    lead: Lead;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ lead }) => {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>View Details</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2">
                        <p><strong>Phone:</strong> {lead.phoneNumber}</p>
                        <p><strong>Email:</strong> {lead.emailAddress}</p>
                        <p><strong>Address:</strong> {`${lead.propertyAddress}, ${lead.city}, ${lead.state} ${lead.zipCode}`}</p>
                        <p><strong>Home Owner:</strong> {lead.isHomeOwner ? 'Yes' : 'No'}</p>
                        <p><strong>Property Value:</strong> ${lead.propertyValue.toLocaleString()}</p>
                        <p><strong>Has Realtor Contract:</strong> {lead.hasRealtorContract ? 'Yes' : 'No'}</p>
                        <p><strong>Submission Date:</strong> {new Date(lead.submissionDate).toLocaleString()}</p>
                        <p><strong>Recording:</strong> {lead.recording || 'N/A'}</p>
                        <p><strong>Bedrooms:</strong> {lead.bedrooms || 'N/A'}</p>
                        <p><strong>Bathrooms:</strong> {lead.bathrooms || 'N/A'}</p>
                        <p><strong>Comments:</strong> {lead.comments || 'N/A'}</p>
                        <h4 className="font-bold mt-4">Assignment History:</h4>
                        {lead.assignments.map((assignment, index) => (
                            <div key={index} className="bg-gray-100 p-2 rounded mb-2">
                                <p><strong>Agent Code:</strong> {assignment.agentCode}</p>
                                <p><strong>Realtor:</strong> {`${assignment.realtorFirstName} ${assignment.realtorLastName}`}</p>
                                <p><strong>Date Sent:</strong> {new Date(assignment.dateSent).toLocaleString()}</p>
                                <p><strong>Status:</strong> {assignment.status}</p>
                                {assignment.comments && <p><strong>Comments:</strong> {assignment.comments}</p>}
                                {assignment.callbackTime && <p><strong>Callback Time:</strong> {new Date(assignment.callbackTime).toLocaleString()}</p>}
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};