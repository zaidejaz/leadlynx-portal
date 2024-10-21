// app/unauthorized/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unauthorized Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You do not have permission to access this page.</p>
          <div className="space-x-2">
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
          <Link href="/">
            <Button>Signin</Button>
          </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}