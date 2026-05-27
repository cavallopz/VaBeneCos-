import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, deleteDoc, doc, limit, startAfter, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { Car, Zap, Trash2, Mail, Eye, X, LayoutDashboard, Tags, Users, LogOut, ShieldCheck, Plus, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface Offer {
  id: string;
  provider: string;
  name: string;
  price: number;
  period: 'mese' | 'anno';
  category: 'auto' | 'energia' | 'mutui' | 'internet';
  features: string[];
  rating: number;
  providerLogo: string;
}

export const AdminDashboard = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'offers' | 'leads'>('offers');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastOffer, setLastOffer] = useState<any>(null);
  const [lastLead, setLastLead] = useState<any>(null);
  const PAGE_SIZE = 15;

  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    provider: '',
    name: '',
    price: 0,
    period: 'mese',
    category: 'auto',
    features: ['Assistenza 24h', 'Prezzo bloccato'],
    rating: 4.5,
    providerLogo: 'https://logo.clearbit.com/prima.it'
  });

  useEffect(() => {
    // Initial fetch for offers
    const qOffers = query(collection(db, 'offers'), limit(PAGE_SIZE));
    const unsubscribeOffers = onSnapshot(qOffers, (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer)));
      setLastOffer(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false);
    });

    // Initial fetch for leads
    const qLeads = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLastLead(snapshot.docs[snapshot.docs.length - 1]);
    });

    return () => {
      unsubscribeOffers();
      unsubscribeLeads();
    };
  }, []);

  const loadMoreLeads = async () => {
    if (!lastLead) return;
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), startAfter(lastLead), limit(PAGE_SIZE));
    const snapshot = await getDocs(q);
    const newLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLeads([...leads, ...newLeads]);
    setLastLead(snapshot.docs[snapshot.docs.length - 1]);
  };

  const loadMoreOffers = async () => {
    if (!lastOffer) return;
    const q = query(collection(db, 'offers'), startAfter(lastOffer), limit(PAGE_SIZE));
    const snapshot = await getDocs(q);
    const newOffers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
    setOffers([...offers, ...newOffers]);
    setLastOffer(snapshot.docs[snapshot.docs.length - 1]);
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'offers'), {
        ...newOffer,
        price: Number(newOffer.price),
        createdAt: serverTimestamp()
      });
      setNewOffer({ 
        ...newOffer, 
        provider: '', 
        name: '', 
        price: 0,
        providerLogo: 'https://logo.clearbit.com/prima.it'
      });
    } catch (err) {
      console.error("Error adding offer:", err);
      alert("Errore durante l'aggiunta dell'offerta.");
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questa offerta?")) {
      await deleteDoc(doc(db, 'offers', id));
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm("Eliminare questa richiesta?")) {
      await deleteDoc(doc(db, 'leads', id));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
      {/* WP-Style Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col shrink-0 border-r border-gray-800">
        <div className="h-16 flex items-center px-6 bg-gray-950 border-b border-gray-800">
          <ShieldCheck className="w-6 h-6 text-[#00B14F] mr-3" />
          <h1 className="text-xl font-bold text-white tracking-tight">VaBeneCosì<span className="text-[#00B14F] ml-1 text-sm">Admin</span></h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <button 
                onClick={() => setActiveTab('offers')}
                className={cn("w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", activeTab === 'offers' ? "bg-blue-600 text-white" : "hover:bg-gray-800 hover:text-white")}
              >
                <Tags className={cn("w-5 h-5 mr-3", activeTab === 'offers' ? "text-blue-200" : "text-gray-400")} />
                <span className="flex-1 text-left">Gestione Offerte</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('leads')}
                className={cn("w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", activeTab === 'leads' ? "bg-blue-600 text-white" : "hover:bg-gray-800 hover:text-white")}
              >
                <Users className={cn("w-5 h-5 mr-3", activeTab === 'leads' ? "text-blue-200" : "text-gray-400")} />
                <span className="flex-1 text-left">Leads & Preventivi</span>
                {leads.length > 0 && <span className={cn("ml-auto text-xs py-0.5 px-2 rounded-full font-bold", activeTab === 'leads' ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300")}>{leads.length}</span>}
              </button>
            </li>
          </ul>

          <div className="mt-8 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Piattaforma</div>
          <ul className="space-y-1 px-3">
            <li>
              <a
                href="/"
                className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400" />
                <span className="flex-1 text-left">Vai al Sito</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="p-4 bg-gray-950 border-t border-gray-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[#00B14F] font-bold border border-gray-700">
              A
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">Sviluppatore</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="flex-1 text-left">Disconnetti</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Topbar */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0 z-10 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            {activeTab === 'offers' ? 'Offerte' : 'Leads'}
            <ChevronRight className="w-5 h-5 mx-2 text-gray-400" />
            <span className="text-gray-500 font-normal text-lg">Panoramica</span>
          </h2>
          <div className="flex items-center">
            <div className="text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Sistema Attivo
            </div>
          </div>
        </header>

        {/* Workspace Area */}
        <div className="flex-1 overflow-y-auto p-8 w-full block bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'offers' ? (
              <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-50 p-4 rounded-xl text-blue-600"><Tags className="w-8 h-8" /></div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Offerte Totali</p>
                        <h3 className="text-3xl font-bold text-gray-900">{offers.length}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-50 p-4 rounded-xl text-orange-600"><Car className="w-8 h-8" /></div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Categoria Auto</p>
                        <h3 className="text-3xl font-bold text-gray-900">{offers.filter(o => o.category === 'auto').length}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="bg-yellow-50 p-4 rounded-xl text-yellow-600"><Zap className="w-8 h-8" /></div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Categoria Energia</p>
                        <h3 className="text-3xl font-bold text-gray-900">{offers.filter(o => o.category === 'energia').length}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-bold text-gray-900 flex items-center"><Plus className="w-5 h-5 mr-2 text-blue-600"/> Pubblica Nuova Offerta</h3>
                  </div>
                  <form onSubmit={handleAddOffer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Compagnia (Provider)</label>
                      <input 
                        type="text" placeholder="Es. Prima Assicurazioni" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newOffer.provider}
                        onChange={e => setNewOffer({...newOffer, provider: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Nome Offerta</label>
                      <input 
                        type="text" placeholder="Es. RCA Base" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newOffer.name}
                        onChange={e => setNewOffer({...newOffer, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Prezzo (€)</label>
                      <input 
                        type="number" placeholder="Es. 29.99" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newOffer.price}
                        onChange={e => setNewOffer({...newOffer, price: Number(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Categoria</label>
                      <select 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newOffer.category}
                        onChange={e => setNewOffer({...newOffer, category: e.target.value as any})}
                      >
                        <option value="auto">Auto</option>
                        <option value="energia">Energia</option>
                        <option value="mutui">Mutui</option>
                        <option value="internet">Internet</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Periodo di Fatturazione</label>
                      <select 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={newOffer.period}
                        onChange={e => setNewOffer({...newOffer, period: e.target.value as any})}
                      >
                        <option value="mese">Mese</option>
                        <option value="anno">Anno</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className="w-full bg-blue-600 text-white p-3 font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Aggiungi al catalogo
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                     <h3 className="text-lg font-bold text-gray-900">Catalogo Offerte ({offers.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="p-4 font-semibold">Dettagli Offerta</th>
                          <th className="p-4 font-semibold">Categoria</th>
                          <th className="p-4 font-semibold">Tariffa</th>
                          <th className="p-4 font-semibold text-right">Azioni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {offers.map(offer => (
                          <tr key={offer.id} className="group hover:bg-blue-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{offer.provider}</span>
                                <span className="text-gray-500 text-sm">{offer.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold rounded-full uppercase tracking-tight">{offer.category}</span>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-gray-900">€{offer.price} <span className="text-gray-400 text-sm font-normal">/{offer.period}</span></div>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleDeleteOffer(offer.id)}
                                className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Elimina"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {offers.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nessuna offerta nel database.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {lastOffer && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-center">
                      <button 
                        onClick={loadMoreOffers}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold"
                      >
                        Vedi ancora
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xl font-bold text-gray-900">Leads Ricevuti ({leads.length})</h3>
                </div>
                
                {leads.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Nessun Lead</h3>
                    <p className="text-gray-500">Non hai ancora ricevuto richieste di preventivo.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {leads.map(lead => (
                      <div key={lead.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center group hover:border-blue-300 transition-all hover:shadow-md">
                        <div className="flex items-center space-x-5 mb-4 md:mb-0">
                          <div className={cn(
                            "p-4 rounded-full",
                            lead.category === 'auto' ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                          )}>
                            {lead.category === 'auto' ? <Car className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border",
                                lead.category === 'auto' ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"
                              )}>
                                {lead.category}
                              </span>
                              <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleString() : 'Data non disponibile'}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg flex items-center">
                              {lead.email}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                          <button 
                            onClick={() => setSelectedLead(lead)}
                            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all font-semibold"
                            title="Visualizza Dettagli"
                          >
                            <Eye className="w-4 h-4" /> <span>Dettagli</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteLead(lead.id)}
                            className="bg-white text-gray-400 border border-gray-200 p-2 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shrink-0"
                            title="Elimina Lead"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(activeTab === 'leads' && lastLead) && (
                  <div className="flex justify-center mt-8 pt-4">
                    <button 
                      onClick={loadMoreLeads}
                      className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold"
                    >
                      Carica Altri Lead
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modern Lead Details Modal Drawer style */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 md:p-0">
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white h-full w-full md:w-[600px] shadow-2xl flex flex-col md:rounded-l-3xl overflow-hidden"
            >
              <div className="bg-gray-900 p-6 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-800 p-2 rounded-lg">
                    {selectedLead.category === 'auto' ? <Car className="w-5 h-5 text-orange-400" /> : <Zap className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Dettaglio Lead</h3>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">{selectedLead.category}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-gray-800 rounded-full transition-colors bg-gray-800/50">
                  <X className="w-6 h-6 text-gray-300" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50 space-y-8">
                {selectedLead.category === 'auto' ? (
                  <>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center border-b pb-2"><Car className="w-4 h-4 mr-2"/> Veicolo</h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Targa</p>
                          <p className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded inline-block uppercase">{selectedLead.plate || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Marca/Modello</p>
                          <p className="font-bold text-gray-900 truncate">{selectedLead.brand || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Alimentazione</p>
                          <p className="font-bold text-gray-900">{selectedLead.fuel || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Km Annui</p>
                          <p className="font-bold text-gray-900">{selectedLead.mileage || 'N/D'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center border-b pb-2"><Users className="w-4 h-4 mr-2"/> Conducente</h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Data Nascita</p>
                          <p className="font-bold text-gray-900">{selectedLead.dob || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Stato Civile</p>
                          <p className="font-bold text-gray-900">{selectedLead.maritalStatus || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Professione</p>
                          <p className="font-bold text-gray-900 truncate">{selectedLead.occupation || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Anno Patente</p>
                          <p className="font-bold text-gray-900">{selectedLead.licenseYear || 'N/D'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center border-b pb-2"><ShieldCheck className="w-4 h-4 mr-2"/> Assicurazione</h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Classe Merito</p>
                          <p className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block">{selectedLead.meritClass || 'N/D'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Scadenza</p>
                          <p className="font-bold text-gray-900">{selectedLead.expiryDate || 'N/D'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500 mb-1">Anni senza sinistri</p>
                          <p className="font-bold text-gray-900">{selectedLead.yearsWithoutAccidents || 'N/D'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center border-b pb-2"><Zap className="w-4 h-4 mr-2"/> Utenza Energia</h4>
                      <p className="text-gray-500 text-sm">Dettagli per la fornitura luce e gas</p>
                      {/* Mapping generic energy lead details, if they existed */}
                  </div>
                )}

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-blue-800 uppercase tracking-widest flex items-center border-b border-blue-200 pb-2"><Mail className="w-4 h-4 mr-2"/> Recapiti Client</h4>
                  <div className="grid grid-cols-1 gap-y-4 text-sm">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <p className="text-blue-600/70 mb-0.5 text-xs">Email</p>
                        <p className="font-bold text-blue-900 text-lg">{selectedLead.email || 'N/D'}</p>
                      </div>
                    </div>
                    {selectedLead.phone && (
                      <div className="flex items-center mt-2">
                        <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 text-[10px]">☎</div>
                        <div>
                          <p className="text-blue-600/70 mb-0.5 text-xs">Telefono</p>
                          <p className="font-bold text-blue-900">{selectedLead.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white border-t border-gray-200 shrink-0 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Ricevuto in data: {selectedLead.createdAt?.toDate ? selectedLead.createdAt.toDate().toLocaleDateString() : ''}</span>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
                >
                  Chiudi Scheda
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
