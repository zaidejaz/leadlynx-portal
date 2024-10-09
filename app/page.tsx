import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Welcome</h2>
            <p className="mt-1 text-4xl font-extrabold text-foreground sm:text-5xl sm:tracking-tight lg:text-6xl">
              Manage Your Real Estate Leads Efficiently
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-muted-foreground">
              Our platform helps you streamline your lead management process, from generation to conversion.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link href="/auth/signin">
                <Button size="lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground text-sm">
            &copy; 2024 Real Estate Lead Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}