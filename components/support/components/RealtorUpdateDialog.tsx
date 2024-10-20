import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Realtor } from '../../support/types';

interface RealtorUpdateDialogProps {
    realtor: Realtor;
    handleUpdateRealtorInfo: (realtorId: string, field: string, value: boolean | string) => Promise<void>;
}

export const RealtorUpdateDialog: React.FC<RealtorUpdateDialogProps> = ({ realtor, handleUpdateRealtorInfo }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Update</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Realtor Information</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Switch
                            id="status"
                            checked={realtor.isActive}
                            onCheckedChange={(checked) => handleUpdateRealtorInfo(realtor.id, 'isActive', checked)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contactSigned" className="text-right">
                            Contact Signed
                        </Label>
                        <Switch
                            id="contactSigned"
                            checked={realtor.contactSigned}
                            onCheckedChange={(checked) => handleUpdateRealtorInfo(realtor.id, 'contactSigned', checked)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contractSent" className="text-right">
                            Contract Sent
                        </Label>
                        <Switch
                            id="contractSent"
                            checked={realtor.contractSent}
                            onCheckedChange={(checked) => handleUpdateRealtorInfo(realtor.id, 'contractSent', checked)}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};