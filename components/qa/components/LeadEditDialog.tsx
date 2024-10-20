import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead } from '../types';

interface LeadEditDialogProps {
  lead: Lead;
  editingLead: Lead | null;
  onEditLead: (lead: Lead) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onUpdate: () => void;
}

export const LeadEditDialog: React.FC<LeadEditDialogProps> = ({ 
  lead, 
  editingLead, 
  onEditLead, 
  onInputChange, 
  onUpdate 
}) => {
  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      onEditLead(lead);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Update</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        {editingLead && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">First Name</Label>
              <Input id="firstName" name="firstName" value={editingLead.firstName} onChange={onInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">Last Name</Label>
              <Input id="lastName" name="lastName" value={editingLead.lastName} onChange={onInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" value={editingLead.phoneNumber} onChange={onInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emailAddress" className="text-right">Email Address</Label>
              <Input id="emailAddress" name="emailAddress" value={editingLead.emailAddress || ''} onChange={onInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyAddress" className="text-right">Property Address</Label>
              <Input id="propertyAddress" name="propertyAddress" value={editingLead.propertyAddress} onChange={onInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">City</Label>
              <Input id="city" name="city" value={editingLead.city} onChange={onInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">State</Label>
              <Input id="state" name="state" value={editingLead.state} onChange={onInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zipCode" className="text-right">Zip Code</Label>
              <Input id="zipCode" name="zipCode" value={editingLead.zipCode} onChange={onInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isHomeOwner" className="text-right">Home Owner</Label>
              <Select name="isHomeOwner" onValueChange={(value) => onInputChange({ target: { name: 'isHomeOwner', value } } as any)} value={editingLead.isHomeOwner.toString()}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyValue" className="text-right">Property Value</Label>
              <Input id="propertyValue" name="propertyValue" type="number" value={editingLead.propertyValue.toString()} onChange={onInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hasRealtorContract" className="text-right">Realtor Contract</Label>
              <Select name="hasRealtorContract" onValueChange={(value) => onInputChange({ target: { name: 'hasRealtorContract', value } } as any)} value={editingLead.hasRealtorContract.toString()}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select name="status" onValueChange={(value) => onInputChange({ target: { name: 'status', value } } as any)} value={editingLead.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="no_coverage">No Coverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recording" className="text-right">Recording URL</Label>
              <Input id="recording" name="recording" value={editingLead.recording || ''} onChange={onInputChange} className="col-span-3" />
            </div>
          </div>
        )}
        <Button onClick={() => { onUpdate(); setOpen(false); }}>Save changes</Button>
      </DialogContent>
    </Dialog>
  );
};