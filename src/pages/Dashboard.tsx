import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BatteryIndicator } from '@/components/BatteryIndicator';
import { User, Car, Play, Square, IndianRupee, History, Zap } from 'lucide-react';
import { format } from 'date-fns';

const RATE_PER_KWH = 8; // ₹8 per kWh

export default function Dashboard() {
  const { user, profile, vehicle, chargingHistory, isCharging, startCharging, stopCharging, updateBatteryPercentage, loading } = useAuth();
  const navigate = useNavigate();
  const chargingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) { navigate('/login'); return; }
    if (!loading && user && !vehicle) { navigate('/register-vehicle'); }
  }, [user, vehicle, loading, navigate]);

  // Simulate battery charging
  useEffect(() => {
    if (isCharging && vehicle) {
      chargingIntervalRef.current = setInterval(() => {
        const current = vehicle.current_charge_percent ?? 0;
        if (current < 100) {
          updateBatteryPercentage(current + 0.5);
        } else {
          stopCharging();
        }
      }, 1000);
    } else if (chargingIntervalRef.current) {
      clearInterval(chargingIntervalRef.current);
    }
    return () => { if (chargingIntervalRef.current) clearInterval(chargingIntervalRef.current); };
  }, [isCharging, vehicle?.current_charge_percent]);

  const calculateMonthlyBill = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEnergy = chargingHistory
      .filter((s) => new Date(s.start_time) >= startOfMonth && s.end_time)
      .reduce((total, s) => total + (s.energy_used_kwh ?? 0), 0);
    return (monthlyEnergy * RATE_PER_KWH).toFixed(2);
  };

  const totalEnergy = chargingHistory
    .filter((s) => s.end_time)
    .reduce((total, s) => total + (s.energy_used_kwh ?? 0), 0);

  if (loading || !user || !vehicle) return null;

  const batteryPercent = vehicle.current_charge_percent ?? 0;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage your EV charging</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Welcome back</CardTitle>
              <CardDescription>{profile?.full_name}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Car className="h-4 w-4" />
              <span>{vehicle.manufacturer} {vehicle.model}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Plate: {vehicle.vehicle_number}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Monthly Bill</CardTitle>
              <CardDescription>Estimated cost this month</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">₹{calculateMonthlyBill()}</p>
            <p className="text-sm text-muted-foreground">@ ₹{RATE_PER_KWH}/kWh</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Total Energy</CardTitle>
              <CardDescription>All-time usage</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalEnergy.toFixed(2)} kWh</p>
            <p className="text-sm text-muted-foreground">{chargingHistory.length} sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Battery Status</CardTitle>
            <CardDescription>Current charge level: {vehicle.battery_capacity_kwh} kWh capacity</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <BatteryIndicator percentage={batteryPercent} isCharging={isCharging} size="lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charging Controls</CardTitle>
            <CardDescription>Start or stop wireless charging</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-6">
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full ${isCharging ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-lg font-medium">Charging: {isCharging ? 'ON' : 'OFF'}</span>
            </div>
            <div className="flex gap-4">
              <Button size="lg" onClick={startCharging} disabled={isCharging || batteryPercent >= 100} className="gap-2">
                <Play className="h-5 w-5" /> Start Charging
              </Button>
              <Button size="lg" variant="outline" onClick={stopCharging} disabled={!isCharging} className="gap-2">
                <Square className="h-5 w-5" /> Stop Charging
              </Button>
            </div>
            {batteryPercent >= 100 && <p className="text-sm text-primary font-medium">Battery fully charged!</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center gap-4">
          <History className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Charging History</CardTitle>
            <CardDescription>Your recent charging sessions</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {chargingHistory.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <History className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No charging sessions yet</p>
              <p className="text-sm">Start a charging session to see your history here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead className="text-right">Energy Used</TableHead>
                  <TableHead className="text-right">Cost (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chargingHistory.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{format(new Date(session.start_time), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>
                      {session.end_time ? format(new Date(session.end_time), 'MMM d, yyyy HH:mm') : 'In progress...'}
                    </TableCell>
                    <TableCell className="text-right">{(session.energy_used_kwh ?? 0).toFixed(2)} kWh</TableCell>
                    <TableCell className="text-right">₹{(session.cost_inr ?? 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
