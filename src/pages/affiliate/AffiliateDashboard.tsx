import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, deleteDoc, doc, limit, startAfter, serverTimestamp, where, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { Car, Zap, FileText, X, Eye, Plus, ArrowRight, Store, ShieldCheck, LogOut, ChevronRight, LayoutDashboard, UserPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const AffiliateDashboard = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'my-leads' | 'new-lead' | 'profile'>('my-leads');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [affiliateProfile, setAffiliateProfile] = useState<any>(null);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const navigate = useNavigate();

  // New lead form data
  const [leadForm, setLeadForm] = useState({
    category: 'auto',
    email: '',
    phone: '',
    plate: '',
    brand: '',
    name: '',
    surname: ''
  });

  useEffect(() => {
    // We only load if authed
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const qLeads = query(
      collection(db, 'leads'), 
      where('affiliateId', '==', user.uid),
      orderBy('createdAt', 'desc'), 
      limit(50)
    );

    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
       console.error("Error fetching leads - index might be building", error);
       setLoading(false);
    });

    const qAffiliate = query(collection(db, 'affiliates'), where('userId', '==', user.uid));
    const unsubscribeAffiliate = onSnapshot(qAffiliate, (snapshot) => {
      if (!snapshot.empty) {
        setAffiliateProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });

    return () => {
      unsubscribeLeads();
      unsubscribeAffiliate();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateProfile?.id) return;
    
    setProfileUpdating(true);
    try {
      const updateData = {
        ownerName: affiliateProfile.ownerName,
        businessName: affiliateProfile.businessName,
        vatNumber: affiliateProfile.vatNumber,
        fiscalCode: affiliateProfile.fiscalCode,
        address: affiliateProfile.address,
        postalCode: affiliateProfile.postalCode,
        city: affiliateProfile.city,
        province: affiliateProfile.province,
        phone: affiliateProfile.phone,
        sdiPec: affiliateProfile.sdiPec,
        iban: affiliateProfile.iban,
        bankName: affiliateProfile.bankName,
        accountHolder: affiliateProfile.accountHolder
      };
      
      const docRef = doc(db, 'affiliates', affiliateProfile.id);
      await updateDoc(docRef, updateData);
      
      alert('Profilo aggiornato con successo!');
    } catch(e) {
      console.error(e);
      alert('Errore durante l\'aggiornamento del profilo.');
    } finally {
      setProfileUpdating(false);
    }
  }

  const submitNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'leads'), {
        ...leadForm,
        affiliateId: user.uid,
        status: 'new',
        createdAt: serverTimestamp()
      });
      alert('Lead inserito con successo!');
      setLeadForm({
        category: 'auto',
        email: '',
        phone: '',
        plate: '',
        brand: '',
        name: '',
        surname: ''
      });
      setActiveTab('my-leads');
    } catch (err) {
      console.error(err);
      alert('Errore inserimento lead');
    }
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-blue-100 flex flex-col shrink-0 border-r border-blue-800">
        <div className="h-16 flex items-center px-6 bg-blue-950 border-b border-blue-800">
          <Store className="w-6 h-6 text-yellow-400 mr-3" />
          <h1 className="text-xl font-bold text-white tracking-tight">Partner<span className="text-yellow-400 ml-1 text-sm">Zone</span></h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <button 
                onClick={() => setActiveTab('my-leads')}
                className={cn("w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", activeTab === 'my-leads' ? "bg-blue-600 text-white" : "hover:bg-blue-800 hover:text-white")}
              >
                <LayoutDashboard className={cn("w-5 h-5 mr-3", activeTab === 'my-leads' ? "text-blue-200" : "text-blue-400")} />
                <span className="flex-1 text-left">Le mie Pratiche</span>
                {leads.length > 0 && <span className={cn("ml-auto text-xs py-0.5 px-2 rounded-full font-bold", activeTab === 'my-leads' ? "bg-white text-blue-600" : "bg-blue-800 text-blue-300")}>{leads.length}</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('new-lead')}
                className={cn("w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", activeTab === 'new-lead' ? "bg-blue-600 text-white" : "hover:bg-blue-800 hover:text-white")}
              >
                <UserPlus className={cn("w-5 h-5 mr-3", activeTab === 'new-lead' ? "text-blue-200" : "text-blue-400")} />
                <span className="flex-1 text-left">Nuovo Preventivo</span>
              </button>
            </li>
          </ul>

          <div className="mt-8 px-6 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Generale</div>
          <ul className="space-y-1 px-3">
            <li>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-blue-300 hover:bg-blue-800 hover:text-white transition-colors"
              >
                <Store className="w-5 h-5 mr-3 text-blue-400" />
                <span className="flex-1 text-left">Vai al Sito</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-4 bg-blue-950 border-t border-blue-800">
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn("w-full flex items-center mb-4 p-2 rounded-xl transition-colors text-left", activeTab === 'profile' ? "bg-blue-900" : "hover:bg-blue-900")}
          >
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-yellow-400 font-bold border border-blue-700 shrink-0">
              {auth.currentUser?.displayName?.[0] || 'P'}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white truncate">{auth.currentUser?.displayName || 'Partner'}</p>
              <p className="text-xs text-blue-400 truncate">Affiliato</p>
            </div>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="flex-1 text-left">Disconnetti</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0 z-10 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
            {activeTab === 'my-leads' ? 'Le mie Pratiche' : activeTab === 'profile' ? 'Profilo Affiliato' : 'Inserisci Nuovo Preventivo'}
            <ChevronRight className="w-5 h-5 mx-2 text-gray-400" />
            <span className="text-gray-500 font-normal text-lg">Area Partner</span>
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto w-full p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {activeTab === 'my-leads' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center">
                      <div className="bg-blue-50 p-4 rounded-xl text-blue-600 mr-4"><FileText className="w-6 h-6" /></div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Totale Richieste</p>
                        <h3 className="text-3xl font-bold text-gray-900">{leads.length}</h3>
                      </div>
                    </div>
                  </div>

                  {leads.length === 0 && !loading ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Nessuna pratica</h3>
                      <p className="text-gray-500 mb-6">Non hai ancora inserito nessuna richiesta di preventivo per i tuoi clienti.</p>
                      <button onClick={() => setActiveTab('new-lead')} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700">
                        Inserisci il primo a cliente
                      </button>
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
                                  {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleString() : ''}
                                </span>
                              </div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                {lead.name} {lead.surname} <span className="text-gray-400 font-normal md:text-base">- {lead.email}</span>
                              </h4>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                             {/* Only show details locally for now */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
            ) : activeTab === 'new-lead' ? (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Dati Cliente</h3>
                    <form onSubmit={submitNewLead} className="space-y-6">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Categoria Preventivo</label>
                          <select 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                            value={leadForm.category}
                            onChange={e => setLeadForm({...leadForm, category: e.target.value as any})}
                          >
                            <option value="auto">Assicurazione Auto</option>
                            <option value="energia">Energia (Luce/Gas)</option>
                            <option value="mutui">Mutui/Prestiti</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Nome Cliente</label>
                                <input 
                                    type="text" required placeholder="Es. Mario" 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Cognome Cliente</label>
                                <input 
                                    type="text" required placeholder="Es. Rossi" 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    value={leadForm.surname} onChange={e => setLeadForm({...leadForm, surname: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Telefono</label>
                                <input 
                                    type="tel" required placeholder="Obbligatorio" 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Email Contatto</label>
                                <input 
                                    type="email" required placeholder="Consigliato" 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})}
                                />
                            </div>
                        </div>

                        {leadForm.category === 'auto' && (
                            <div className="grid grid-cols-2 gap-4 p-4 border border-orange-100 bg-orange-50/50 rounded-2xl">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Targa Veicolo</label>
                                    <input 
                                        type="text" required placeholder="Es. AB123CD" 
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 uppercase"
                                        value={leadForm.plate} onChange={e => setLeadForm({...leadForm, plate: e.target.value.toUpperCase()})}
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-blue-600 text-white p-4 font-bold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg flex items-center justify-center transition-all">
                            <Plus className="w-5 h-5 mr-2" />
                            Invia Richiesta di Preventivo
                        </button>
                    </form>
                </div>
            ) : activeTab === 'profile' && affiliateProfile ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                    <Store className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Il Tuo Profilo</h3>
                    <p className="text-gray-500 text-sm">Aggiorna le informazioni della tua attività</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Ragione Sociale / Nome Attività</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={affiliateProfile.businessName || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, businessName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Nome Referente</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={affiliateProfile.ownerName || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, ownerName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Partita IVA</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={affiliateProfile.vatNumber || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, vatNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Codice Fiscale</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 uppercase"
                        value={affiliateProfile.fiscalCode || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, fiscalCode: e.target.value.toUpperCase()})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Indirizzo Sede</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={affiliateProfile.address || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, address: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Città</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={affiliateProfile.city || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, city: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">CAP</label>
                        <input 
                          type="text" required maxLength={5}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                          value={affiliateProfile.postalCode || ''} 
                          onChange={e => setAffiliateProfile({...affiliateProfile, postalCode: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Provincia</label>
                        <input 
                          type="text" required maxLength={2}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 uppercase"
                          value={affiliateProfile.province || ''} 
                          onChange={e => setAffiliateProfile({...affiliateProfile, province: e.target.value.toUpperCase()})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">SDI o PEC</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={affiliateProfile.sdiPec || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, sdiPec: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Nome Banca</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={affiliateProfile.bankName || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, bankName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Intestatario Conto Corrente</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={affiliateProfile.accountHolder || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, accountHolder: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">IBAN Compensi</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 uppercase"
                        value={affiliateProfile.iban || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, iban: e.target.value.toUpperCase()})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Telefono</label>
                      <input 
                        type="tel" required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={affiliateProfile.phone || ''} 
                        onChange={e => setAffiliateProfile({...affiliateProfile, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Email Login</label>
                      <input 
                        type="email" disabled
                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                        value={affiliateProfile.email || ''} 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={profileUpdating}
                    className="w-full bg-blue-600 text-white p-4 font-bold rounded-xl hover:bg-blue-700 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
                  >
                    {profileUpdating ? "Salvato in corso..." : "Salva Modifiche"}
                  </button>
                </form>
              </div>
            ) : null}
            
          </div>
        </div>
      </main>
    </div>
  );
};
