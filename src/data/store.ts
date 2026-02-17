import { Cliente, Prestation, RendezVous, Paiement } from '@/types';

const KEYS = {
  clientes: 'salon_clientes',
  prestations: 'salon_prestations',
  rendezVous: 'salon_rendezvous',
  paiements: 'salon_paiements',
};

function load<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// CLIENTES
export function getClientes(): Cliente[] {
  return load<Cliente>(KEYS.clientes);
}
export function addCliente(c: Omit<Cliente, 'id' | 'dateCreation'>): Cliente {
  const clientes = getClientes();
  const newC: Cliente = { ...c, id: genId(), dateCreation: new Date().toISOString().slice(0, 10) };
  clientes.push(newC);
  save(KEYS.clientes, clientes);
  return newC;
}
export function updateCliente(id: string, data: Partial<Cliente>) {
  const clientes = getClientes().map(c => c.id === id ? { ...c, ...data } : c);
  save(KEYS.clientes, clientes);
}
export function deleteCliente(id: string) {
  save(KEYS.clientes, getClientes().filter(c => c.id !== id));
}

// PRESTATIONS
export function getPrestations(): Prestation[] {
  const p = load<Prestation>(KEYS.prestations);
  if (p.length === 0) {
    const defaults: Prestation[] = [
      { id: genId(), nom: 'Coupe femme', duree: 45, prix: 150, categorie: 'Coupe' },
      { id: genId(), nom: 'Brushing', duree: 30, prix: 100, categorie: 'Coiffure' },
      { id: genId(), nom: 'Coloration', duree: 90, prix: 300, categorie: 'Couleur' },
      { id: genId(), nom: 'Mèches / Balayage', duree: 120, prix: 450, categorie: 'Couleur' },
      { id: genId(), nom: 'Soin kératine', duree: 60, prix: 500, categorie: 'Soin' },
      { id: genId(), nom: 'Coupe + Brushing', duree: 60, prix: 200, categorie: 'Coupe' },
    ];
    save(KEYS.prestations, defaults);
    return defaults;
  }
  return p;
}
export function addPrestation(p: Omit<Prestation, 'id'>): Prestation {
  const prestations = getPrestations();
  const newP: Prestation = { ...p, id: genId() };
  prestations.push(newP);
  save(KEYS.prestations, prestations);
  return newP;
}
export function updatePrestation(id: string, data: Partial<Prestation>) {
  save(KEYS.prestations, getPrestations().map(p => p.id === id ? { ...p, ...data } : p));
}
export function deletePrestation(id: string) {
  save(KEYS.prestations, getPrestations().filter(p => p.id !== id));
}

// RENDEZ-VOUS
export function getRendezVous(): RendezVous[] {
  return load<RendezVous>(KEYS.rendezVous);
}
export function addRendezVous(rv: Omit<RendezVous, 'id'>): RendezVous {
  const list = getRendezVous();
  const newRV: RendezVous = { ...rv, id: genId() };
  list.push(newRV);
  save(KEYS.rendezVous, list);
  return newRV;
}
export function updateRendezVous(id: string, data: Partial<RendezVous>) {
  save(KEYS.rendezVous, getRendezVous().map(rv => rv.id === id ? { ...rv, ...data } : rv));
}
export function deleteRendezVous(id: string) {
  save(KEYS.rendezVous, getRendezVous().filter(rv => rv.id !== id));
}

// PAIEMENTS
export function getPaiements(): Paiement[] {
  return load<Paiement>(KEYS.paiements);
}
export function addPaiement(p: Omit<Paiement, 'id'>): Paiement {
  const list = getPaiements();
  const newP: Paiement = { ...p, id: genId() };
  list.push(newP);
  save(KEYS.paiements, list);
  return newP;
}

export function formatMAD(amount: number): string {
  return `${amount.toLocaleString('fr-MA')} MAD`;
}
