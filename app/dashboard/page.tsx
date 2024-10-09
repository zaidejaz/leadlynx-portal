"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const rolePages = {
    admin: [
      { title: 'Lead Management', href: '/leadgen' },
      { title: 'Quality Assurance', href: '/qa' },
      { title: 'Support', href: '/support' },
      { title: 'Sales', href: '/sales' },
    ],
    leadgen: [{ title: 'Lead Generation', href: '/leadgen' }],
    qa: [{ title: 'Quality Assurance', href: '/qa' }],
    realtor: [{ title: 'Realtor Dashboard', href: '/realtor' }],
    support: [{ title: 'Support Dashboard', href: '/support' }],
    sales: [{ title: 'Sales Dashboard', href: '/sales' }],
  };

  const userRolePages = rolePages[session.user.role as keyof typeof rolePages] || [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userRolePages.map((page, index) => (
          <Link href={page.href} key={index}>
            <Card>
              <CardHeader>
                <CardTitle>{page.title}</CardTitle>
              </CardHeader>
              <CardContent>
                Click to access {page.title}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}