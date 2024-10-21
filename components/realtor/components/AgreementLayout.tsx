import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from 'lucide-react';

interface AgreementLayoutProps {
  title: string;
  children: React.ReactNode;
  onDownload: () => void;
  onConfirmSent: () => void;
  contractSent: boolean;
}

export const AgreementLayout: React.FC<AgreementLayoutProps> = ({
  title,
  children,
  onDownload,
  onConfirmSent,
  contractSent
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleConfirmClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmYes = () => {
    setIsConfirmDialogOpen(false);
    onConfirmSent();
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gray-100 border-b">
          <div className="flex justify-between items-center">
            <Image src="/LeadLynx - logo.png" alt="LeadLynx Logo" width={150} height={50} />
            <CardTitle className="text-2xl font-bold text-gray-800">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="mt-6">
          {children}
          <div className="flex justify-between items-center mt-8">
            <Button onClick={onDownload} className="bg-orange-500 hover:bg-orange-600 text-white">
              Download Agreement
            </Button>
            {!contractSent && (
              <Button onClick={handleConfirmClick} className="bg-green-500 hover:bg-green-600 text-white">
                Confirm Agreement Sent
              </Button>
            )}
          </div>
          {contractSent && (
            <p className="mt-4 text-green-600 font-semibold">
              Our support team will verify and activate your account shortly.
            </p>
          )}
          {!contractSent && (
            <p className="mt-4 text-gray-600 font-medium">
              Please download and sign the contract, then send it to our email at <span className='font-bold'>support@theleadlynx.com</span>. After sending the contract, click <span className='font-bold text-green-500'>Confirm Agreement Sent.</span> Our support team will verify your submission and activate your account.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="p-0 overflow-hidden w-[400px] rounded-lg">
          <div className="p-4 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Confirm Agreement Submission</h2>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setIsConfirmDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm mb-3">
              Are you sure you have signed the agreement and sent it to support@leadlynx.com?
            </p>
            <p className="text-sm">
              By confirming, you <span className="text-blue-600">acknowledge</span> that you've completed these 
              steps and are ready to proceed with your account activation.
            </p>
          </div>
          <div className="flex justify-end space-x-2 p-3 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              className="text-sm bg-white hover:bg-gray-50"
            >
              No, I haven't sent it yet
            </Button>
            <Button
              onClick={handleConfirmYes}
              className="text-sm bg-green-500 text-white hover:bg-green-600"
            >
              Yes, I have sent the agreement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};