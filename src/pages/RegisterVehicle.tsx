import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Car } from 'lucide-react';
import { useEffect, useState } from 'react';

const manufacturers = [
  'Tesla', 'Rivian', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz',
  'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Nissan', 'Porsche',
  'Lucid', 'Polestar', 'Tata', 'MG', 'BYD', 'Other',
];

const vehicleSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required').max(20),
  manufacturer: z.string().min(1, 'Please select a manufacturer'),
  model: z.string().min(1, 'Model is required').max(50),
  batteryCapacity: z.number().min(10, 'Battery capacity must be at least 10 kWh').max(200),
  batteryPercentage: z.number().min(0).max(100),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function RegisterVehicle() {
  const { user, vehicle, registerVehicle, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleNumber: vehicle?.vehicle_number || '',
      manufacturer: vehicle?.manufacturer || '',
      model: vehicle?.model || '',
      batteryCapacity: vehicle?.battery_capacity_kwh || 75,
      batteryPercentage: vehicle?.current_charge_percent || 50,
    },
  });

  const batteryPercentage = form.watch('batteryPercentage');

  const onSubmit = async (data: VehicleFormValues) => {
    setIsSubmitting(true);
    const success = await registerVehicle({
      vehicle_number: data.vehicleNumber,
      manufacturer: data.manufacturer,
      model: data.model,
      battery_capacity_kwh: data.batteryCapacity,
      current_charge_percent: data.batteryPercentage,
    });

    if (success) {
      toast({
        title: vehicle ? 'Vehicle updated!' : 'Vehicle registered!',
        description: `Your ${data.manufacturer} ${data.model} has been ${vehicle ? 'updated' : 'registered'}.`,
      });
      navigate('/dashboard');
    } else {
      toast({ title: 'Error', description: 'Failed to save vehicle.', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{vehicle ? 'Update Vehicle' : 'Register Your EV'}</CardTitle>
          <CardDescription>
            {vehicle ? 'Update your vehicle information below' : 'Enter your electric vehicle details to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="vehicleNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Number</FormLabel>
                  <FormControl><Input placeholder="MH-01-AB-1234" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="manufacturer" render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select manufacturer" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover">
                      {manufacturers.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl><Input placeholder="Model 3, Nexon EV, etc." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="batteryCapacity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Battery Capacity (kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" min={10} max={200} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="batteryPercentage" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Battery Percentage: {batteryPercentage}%</FormLabel>
                  <FormControl>
                    <Slider min={0} max={100} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} className="py-4" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Register Vehicle'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
