import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gray-100 border-b">
          <div className="flex justify-between items-center">
            <Image src="/logo.png" alt="LeadLynx Logo" width={150} height={50} />
            <CardTitle className="text-2xl font-bold text-gray-800">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="mt-6">
          {children}
          <div className="mt-8 flex justify-between items-center">
            <Button onClick={onDownload} className="bg-blue-600 hover:bg-blue-700 text-white">
              Download Agreement
            </Button>
            {!contractSent && (
              <Button onClick={onConfirmSent} className="bg-green-600 hover:bg-green-700 text-white">
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
            <p className="mt-4 text-gray-600">
              Please sign the contract and send it to our email at support@theleadlynx.com. 
              Our support team will verify and activate your account.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};