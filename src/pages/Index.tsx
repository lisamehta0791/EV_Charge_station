import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Battery, Car, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            Wireless EV Charging
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Power Your EV
            <span className="block text-primary">The Smart Way</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            Experience seamless wireless charging for your electric vehicle. 
            Monitor your battery, track usage, and manage costs all in one place.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Get Started
                <Zap className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose EV Charge?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-background p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Battery className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Real-time Monitoring</h3>
              <p className="text-muted-foreground">
                Track your battery status in real-time with our intuitive dashboard.
              </p>
            </div>
            <div className="rounded-xl bg-background p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Easy Setup</h3>
              <p className="text-muted-foreground">
                Register your vehicle in minutes and start charging wirelessly.
              </p>
            </div>
            <div className="rounded-xl bg-background p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Cost Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your energy usage and estimated monthly costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">EV Charge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 EV Charge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
