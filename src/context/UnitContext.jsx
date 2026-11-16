import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const UnitContext = createContext(null);

export function UnitProvider({ children, token, user }) {
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  
  // Initialize from localStorage or fallback
  const savedUnit = localStorage.getItem('bw_selected_unit');
  const [selectedUnitId, setSelectedUnitIdState] = useState(savedUnit || 'ALL');
  const [unitRefreshKey, setUnitRefreshKey] = useState(0);

  // Determine if user can switch units
  const canSwitchUnit = user?.role === 'admin' || !user?.unit_id;

  // Load units from API
  const fetchUnits = useCallback(() => {
    if (!token) return;
    setLoadingUnits(true);
    fetch('http://localhost:5000/api/units', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const unitList = Array.isArray(data) ? data : [];
        setUnits(unitList);
        setLoadingUnits(false);

        // If user is locked to a specific unit, enforce it
        if (!canSwitchUnit && user?.unit_id) {
          const enforced = String(user.unit_id);
          setSelectedUnitIdState(enforced);
          localStorage.setItem('bw_selected_unit', enforced);
        } else {
          // If savedUnit is specific ID but no longer in unitList, or invalid
          if (savedUnit && savedUnit !== 'ALL') {
            const exists = unitList.some(u => String(u.id) === String(savedUnit));
            if (!exists && unitList.length > 0) {
              setSelectedUnitIdState('ALL');
              localStorage.setItem('bw_selected_unit', 'ALL');
            }
          }
        }
      })
      .catch(err => {
        console.error('Error fetching units for UnitContext:', err);
        setLoadingUnits(false);
      });
  }, [token, user, canSwitchUnit, savedUnit]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // Handle unit switch
  const switchUnit = (newUnitId) => {
    if (!canSwitchUnit && user?.unit_id && String(newUnitId) !== String(user.unit_id)) {
      toast.error('আপনার কেবল নির্দিষ্ট ইউনিটে অ্যাক্সেস রয়েছে!');
      return;
    }

    const validId = newUnitId ? String(newUnitId) : 'ALL';
    setSelectedUnitIdState(validId);
    localStorage.setItem('bw_selected_unit', validId);

    // Increment refresh key to trigger auto-reload across all views
    setUnitRefreshKey(prev => prev + 1);

    // Dispatch global event for non-react or outside listeners
    window.dispatchEvent(new CustomEvent('unit-changed', { detail: validId }));

    // Show toast feedback
    if (validId === 'ALL') {
      toast.success('🌐 সকল ইউনিট (All Units) ডাটা ভিউ সক্রিয় করা হয়েছে!');
    } else {
      const targetUnit = units.find(u => String(u.id) === String(validId));
      toast.success(`🏭 সক্রিয় ইউনিট: ${targetUnit ? targetUnit.name : validId} - ডাটা রিফ্রেশ করা হয়েছে!`);
    }
  };

  const selectedUnit = selectedUnitId === 'ALL'
    ? null
    : units.find(u => String(u.id) === String(selectedUnitId)) || null;

  return (
    <UnitContext.Provider
      value={{
        units,
        loadingUnits,
        selectedUnitId,
        selectedUnit,
        canSwitchUnit,
        switchUnit,
        unitRefreshKey,
        refetchUnits: fetchUnits
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
}
