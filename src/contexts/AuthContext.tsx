import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string | null;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  user_id: string;
  manufacturer: string | null;
  model: string | null;
  battery_capacity_kwh: number;
  current_charge_percent: number | null;
}

export interface ChargingSession {
  id: string;
  vehicle_id: string;
  road_unit_id: string | null;
  start_time: string;
  end_time: string | null;
  energy_used_kwh: number | null;
  cost_inr: number | null;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  vehicle: Vehicle | null;
  chargingHistory: ChargingSession[];
  isCharging: boolean;
  loading: boolean;
  signup: (email: string, password: string, metadata: { full_name: string; phone_number: string; address: string }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  registerVehicle: (vehicleData: Omit<Vehicle, 'id' | 'user_id'>) => Promise<boolean>;
  startCharging: () => Promise<void>;
  stopCharging: () => Promise<void>;
  updateBatteryPercentage: (percentage: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const RATE_PER_KWH = 8; // ₹8 per kWh

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [chargingHistory, setChargingHistory] = useState<ChargingSession[]>([]);
  const [isCharging, setIsCharging] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) setProfile(data as Profile);
  };

  const fetchVehicle = async (userId: string) => {
    const { data } = await supabase.from('vehicles').select('*').eq('user_id', userId).maybeSingle();
    if (data) setVehicle(data as Vehicle);
    else setVehicle(null);
  };

  const fetchChargingHistory = async (vehicleId: string) => {
    const { data } = await supabase
      .from('charging_sessions')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('start_time', { ascending: false });
    if (data) {
      setChargingHistory(data as ChargingSession[]);
      const activeSession = data.find((s: any) => !s.end_time);
      if (activeSession) {
        setIsCharging(true);
        setCurrentSessionId(activeSession.id);
      }
    }
  };

  const refreshData = async () => {
    if (!user) return;
    await fetchProfile(user.id);
    await fetchVehicle(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Use setTimeout to avoid Supabase auth deadlock
        setTimeout(async () => {
          await fetchProfile(session.user.id);
          await fetchVehicle(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setVehicle(null);
        setChargingHistory([]);
        setIsCharging(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchVehicle(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // When vehicle changes, fetch charging history
  useEffect(() => {
    if (vehicle?.id) {
      fetchChargingHistory(vehicle.id);
    }
  }, [vehicle?.id]);

  const signup = async (email: string, password: string, metadata: { full_name: string; phone_number: string; address: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const registerVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'user_id'>): Promise<boolean> => {
    if (!user) return false;

    if (vehicle) {
      // Update existing
      const { error } = await supabase
        .from('vehicles')
        .update({
          vehicle_number: vehicleData.vehicle_number,
          manufacturer: vehicleData.manufacturer,
          model: vehicleData.model,
          battery_capacity_kwh: vehicleData.battery_capacity_kwh,
          current_charge_percent: vehicleData.current_charge_percent,
        })
        .eq('id', vehicle.id);
      if (error) return false;
    } else {
      // Insert new
      const { error } = await supabase
        .from('vehicles')
        .insert({
          user_id: user.id,
          vehicle_number: vehicleData.vehicle_number,
          manufacturer: vehicleData.manufacturer,
          model: vehicleData.model,
          battery_capacity_kwh: vehicleData.battery_capacity_kwh,
          current_charge_percent: vehicleData.current_charge_percent,
        });
      if (error) return false;
    }
    await fetchVehicle(user.id);
    return true;
  };

  const startCharging = async () => {
    if (!vehicle) return;
    const { data, error } = await supabase
      .from('charging_sessions')
      .insert({
        vehicle_id: vehicle.id,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();
    if (!error && data) {
      setCurrentSessionId(data.id);
      setIsCharging(true);
      setChargingHistory(prev => [data as ChargingSession, ...prev]);
    }
  };

  const stopCharging = async () => {
    if (!currentSessionId || !vehicle) return;
    const session = chargingHistory.find(s => s.id === currentSessionId);
    if (!session) return;

    const endTime = new Date();
    const startTime = new Date(session.start_time);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const energyUsed = Math.min(durationHours * 10, vehicle.battery_capacity_kwh * 0.5);
    const cost = energyUsed * RATE_PER_KWH;

    await supabase
      .from('charging_sessions')
      .update({
        end_time: endTime.toISOString(),
        energy_used_kwh: Math.round(energyUsed * 100) / 100,
        cost_inr: Math.round(cost * 100) / 100,
      })
      .eq('id', currentSessionId);

    setCurrentSessionId(null);
    setIsCharging(false);
    if (vehicle) await fetchChargingHistory(vehicle.id);
  };

  const updateBatteryPercentage = async (percentage: number) => {
    if (!vehicle) return;
    const newPercent = Math.min(100, percentage);
    await supabase
      .from('vehicles')
      .update({ current_charge_percent: newPercent })
      .eq('id', vehicle.id);
    setVehicle(prev => prev ? { ...prev, current_charge_percent: newPercent } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        vehicle,
        chargingHistory,
        isCharging,
        loading,
        signup,
        login,
        logout,
        registerVehicle,
        startCharging,
        stopCharging,
        updateBatteryPercentage,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
