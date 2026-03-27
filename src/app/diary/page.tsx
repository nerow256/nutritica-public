'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { useLanguage } from '@/components/LanguageProvider';
import { foodDatabase } from '@/lib/foods';
import { translateFood, translateCategory } from '@/lib/food-translations';
import { Plus, X, ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react';
import { isLoggedIn, getSessionUserId, dbGetFoodLogs, dbCreateFoodLog, dbDeleteFoodLog, type DbFoodLog } from '@/lib/db';

export default function DiaryPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<DbFoodLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mealType, setMealType] = useState<string>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<typeof foodDatabase[0] | null>(null);
  const [amount, setAmount] = useState('100');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const userId = getSessionUserId();

  const loadEntries = useCallback(async () => {
    if (!userId) return;
    try {
      const foods = await dbGetFoodLogs(userId, date);
      setEntries(foods);
    } catch { setEntries([]); }
  }, [userId, date]);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    loadEntries();
  }, [date, router, loadEntries]);

  const changeDate = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split('T')[0]);
  };

  const getDateLabel = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (date === today) return t.today;
    if (date === yesterday) return t.yesterday;
    return new Date(date).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  const filteredFoods = foodDatabase.filter(f => {
    const q = searchQuery.toLowerCase();
    return f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      translateFood(f.name, locale).toLowerCase().includes(q) ||
      translateCategory(f.category, locale).toLowerCase().includes(q);
  });

  const addFood = async () => {
    if (!selectedFood || !userId) return;
    const g = parseFloat(amount) || 100;
    const mult = g / 100;
    try {
      await dbCreateFoodLog({
        date,
        mealType,
        foodName: selectedFood.name,
        amount: g,
        calories: Math.round(selectedFood.calories * mult),
        protein: Math.round(selectedFood.protein * mult * 10) / 10,
        carbs: Math.round(selectedFood.carbs * mult * 10) / 10,
        fat: Math.round(selectedFood.fat * mult * 10) / 10,
        userId,
      });
      resetModal();
      loadEntries();
    } catch { /* modal stays open so user can retry */ }
  };

  const addCustomFood = async () => {
    if (!customName || !userId) return;
    try {
      await dbCreateFoodLog({
        date,
        mealType,
        foodName: customName,
        amount: parseFloat(amount) || 100,
        calories: parseFloat(customCal) || 0,
        protein: parseFloat(customProtein) || 0,
        carbs: parseFloat(customCarbs) || 0,
        fat: parseFloat(customFat) || 0,
        userId,
      });
      resetModal();
      loadEntries();
    } catch { /* modal stays open so user can retry */ }
  };

  const deleteEntry = async (id: string) => {
    try {
      await dbDeleteFoodLog(id);
      loadEntries();
    } catch { /* silently fail, entry remains visible */ }
  };

  const resetModal = () => {
    setShowModal(false);
    setSelectedFood(null);
    setSearchQuery('');
    setAmount('100');
    setShowCustom(false);
    setCustomName(''); setCustomCal(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat('');
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealIcons: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍪' };
  const totalCal = entries.reduce((s, e) => s + e.calories, 0);
  const totalP = entries.reduce((s, e) => s + e.protein, 0);
  const totalC = entries.reduce((s, e) => s + e.carbs, 0);
  const totalF = entries.reduce((s, e) => s + e.fat, 0);

  return (
    <div className="min-h-screen m3-surface pb-20 desktop-offset">
      <div className="m3-gradient-header text-white px-6 pt-6 pb-4 rounded-b-[24px] lg:rounded-b-none">
        <div className="lg:max-w-5xl lg:mx-auto">
          <h1 className="m3-title-large mb-3">{t.foodDiary}</h1>
          <div className="flex items-center justify-between lg:justify-start lg:gap-6">
            <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="m3-title-medium">{getDateLabel()}</span>
            <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 m3-stagger lg:max-w-5xl lg:mx-auto lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-4">
        {mealTypes.map(type => {
          const mealEntries = entries.filter(e => e.mealType === type);
          const mealCals = mealEntries.reduce((s, e) => s + e.calories, 0);
          return (
            <div key={type} className="m3-card rounded-[20px] mb-4 lg:mb-0 overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 border-b m3-border">
                <div className="flex items-center gap-2">
                  <span>{mealIcons[type]}</span>
                  <span className="m3-title-small m3-on-surface capitalize">{type === 'breakfast' ? t.breakfast : type === 'lunch' ? t.lunch : type === 'dinner' ? t.dinner : t.snack}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="m3-label-medium m3-outline-text">{Math.round(mealCals)} {t.kcal}</span>
                  <button onClick={() => { setMealType(type); setShowModal(true); }}
                    className="m3-fab-small !w-7 !h-7 !rounded-full">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {mealEntries.length > 0 ? mealEntries.map(entry => (
                <div key={entry.id} className="flex justify-between items-center px-4 py-2.5 border-b m3-border last:border-0">
                  <div>
                    <span className="m3-body-medium m3-on-surface">{translateFood(entry.foodName, locale)}</span>
                    <span className="m3-label-small m3-outline-text ml-2">{entry.amount}g</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="m3-body-medium m3-on-surface-variant">{Math.round(entry.calories)} {t.kcal}</span>
                    <button onClick={() => deleteEntry(entry.id)} className="m3-outline-text hover:text-[var(--m3-error)] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )) : (
                <p className="px-4 py-3 m3-body-medium m3-outline-text">{t.tapToAdd}</p>
              )}
            </div>
          );
        })}
        </div>

        <div className="rounded-[20px] p-4 bg-[var(--m3-primary-container)] mt-4 lg:mt-6">
          <h3 className="m3-title-small text-[var(--m3-on-primary-container)] mb-2">{t.dailySummary}</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div><p className="m3-title-medium m3-on-surface">{Math.round(totalCal)}</p><p className="m3-label-small m3-on-surface-variant">{t.kcal}</p></div>
            <div><p className="m3-title-medium text-blue-500">{Math.round(totalP)}g</p><p className="m3-label-small m3-on-surface-variant">{t.protein}</p></div>
            <div><p className="m3-title-medium text-orange-500">{Math.round(totalC)}g</p><p className="m3-label-small m3-on-surface-variant">{t.carbs}</p></div>
            <div><p className="m3-title-medium text-yellow-500">{Math.round(totalF)}g</p><p className="m3-label-small m3-on-surface-variant">{t.fat}</p></div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="m3-scrim flex items-end justify-center">
          <div className="m3-bottom-sheet w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b m3-border">
              <h3 className="m3-title-medium m3-on-surface">{t.addTo} {mealType === 'breakfast' ? t.breakfast : mealType === 'lunch' ? t.lunch : mealType === 'dinner' ? t.dinner : t.snack}</h3>
              <button onClick={resetModal} className="p-1 rounded-full m3-state-layer m3-outline-text"><X size={24} /></button>
            </div>

            {!selectedFood && !showCustom ? (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 m3-outline-text" size={18} />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t.searchFoods} className="m3-input" style={{ paddingLeft: '2.75rem' }} />
                </div>
                <button onClick={() => setShowCustom(true)} className="w-full mb-3 p-3 rounded-2xl border-2 border-dashed border-[var(--m3-primary-container)] m3-primary-text m3-label-large hover:bg-[var(--m3-primary-container)]/10 transition-colors">
                  {t.customEntry}
                </button>
                <div className="space-y-1">
                  {filteredFoods.map(food => (
                    <button key={food.id} onClick={() => setSelectedFood(food)}
                      className="w-full text-left p-3 rounded-2xl m3-state-layer transition-colors">
                      <div className="flex justify-between">
                        <span className="m3-body-large m3-on-surface">{translateFood(food.name, locale)}</span>
                        <span className="m3-body-medium m3-outline-text">{food.calories} {t.kcal}</span>
                      </div>
                      <span className="m3-label-small m3-on-surface-variant">{translateCategory(food.category, locale)} · {t.per100g}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : showCustom ? (
              <div className="p-4 space-y-3">
                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder={t.foodName} className="m3-input" />
                <input type="number" value={customCal} onChange={e => setCustomCal(e.target.value)} placeholder={t.calories} className="m3-input" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={customProtein} onChange={e => setCustomProtein(e.target.value)} placeholder={`${t.protein} (g)`} className="m3-input text-sm" />
                  <input type="number" value={customCarbs} onChange={e => setCustomCarbs(e.target.value)} placeholder={`${t.carbs} (g)`} className="m3-input text-sm" />
                  <input type="number" value={customFat} onChange={e => setCustomFat(e.target.value)} placeholder={`${t.fat} (g)`} className="m3-input text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowCustom(false)} className="flex-1 m3-btn-outlined py-2.5">{t.back}</button>
                  <button onClick={addCustomFood} className="flex-1 m3-btn-filled py-2.5">{t.add}</button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="m3-title-medium m3-on-surface">{translateFood(selectedFood!.name, locale)}</h4>
                  <p className="m3-body-medium m3-on-surface-variant">{translateCategory(selectedFood!.category, locale)}</p>
                </div>
                <div>
                  <label className="block m3-label-large m3-on-surface-variant mb-1.5">{t.amountGrams}</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="m3-input" />
                </div>
                <div className="grid grid-cols-4 gap-2 text-center m3-surface-container-high rounded-2xl p-3">
                  <div><p className="m3-title-small m3-on-surface">{Math.round(selectedFood!.calories * (parseFloat(amount) || 0) / 100)}</p><p className="m3-label-small m3-on-surface-variant">{t.kcal}</p></div>
                  <div><p className="m3-title-small text-blue-500">{(selectedFood!.protein * (parseFloat(amount) || 0) / 100).toFixed(1)}</p><p className="m3-label-small m3-on-surface-variant">{t.protein}</p></div>
                  <div><p className="m3-title-small text-orange-500">{(selectedFood!.carbs * (parseFloat(amount) || 0) / 100).toFixed(1)}</p><p className="m3-label-small m3-on-surface-variant">{t.carbs}</p></div>
                  <div><p className="m3-title-small text-yellow-500">{(selectedFood!.fat * (parseFloat(amount) || 0) / 100).toFixed(1)}</p><p className="m3-label-small m3-on-surface-variant">{t.fat}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedFood(null)} className="flex-1 m3-btn-outlined py-2.5">{t.back}</button>
                  <button onClick={addFood} className="flex-1 m3-btn-filled py-2.5">{t.addToDiary}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
