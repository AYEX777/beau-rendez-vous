export interface Cliente {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  dateAnniversaire?: string;
  notes?: string;
  dateCreation: string;
}

export interface Prestation {
  id: string;
  nom: string;
  duree: number; // minutes
  prix: number; // MAD
  description?: string;
  categorie?: string;
}

export interface RendezVous {
  id: string;
  clienteId: string;
  date: string; // YYYY-MM-DD
  heure: string; // HH:mm
  prestationId: string;
  statut: 'confirme' | 'en_attente' | 'annule' | 'termine';
  noteInterne?: string;
}

export interface Paiement {
  id: string;
  clienteId: string;
  rendezVousId?: string;
  montant: number;
  modePaiement: 'especes' | 'carte' | 'virement';
  date: string;
}
