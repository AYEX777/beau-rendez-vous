import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getPaiements, addPaiement, getClientes, getRendezVous, getPrestations, formatMAD } from "@/data/store";
import { Paiement } from "@/types";
import { Plus, CreditCard, Banknote, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const MODES = {
  especes: { label: "Espèces", icon: Banknote },
  carte: { label: "Carte", icon: CreditCard },
  virement: { label: "Virement", icon: ArrowRightLeft },
};

export default function Paiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ clienteId: "", rendezVousId: "", montant: 0, modePaiement: "especes" as Paiement['modePaiement'] });

  const clientes = getClientes();
  const rdvs = getRendezVous();
  const prestations = getPrestations();

  const reload = () => setPaiements(getPaiements().sort((a, b) => b.date.localeCompare(a.date)));
  useEffect(reload, []);

  const today = new Date().toISOString().slice(0, 10);
  const totalJour = paiements.filter(p => p.date === today).reduce((s, p) => s + p.montant, 0);

  const handleSave = () => {
    if (!form.clienteId || form.montant <= 0) {
      toast.error("Cliente et montant valide obligatoires");
      return;
    }
    addPaiement({ ...form, date: today });
    toast.success("Paiement enregistré");
    setDialogOpen(false);
    setForm({ clienteId: "", rendezVousId: "", montant: 0, modePaiement: "especes" });
    reload();
  };

  // Auto-fill montant when selecting RDV
  const onSelectRdv = (rdvId: string) => {
    const rdv = rdvs.find(r => r.id === rdvId);
    const prest = rdv ? prestations.find(p => p.id === rdv.prestationId) : null;
    setForm(f => ({ ...f, rendezVousId: rdvId, montant: prest?.prix || f.montant, clienteId: rdv?.clienteId || f.clienteId }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Paiements</h2>
          <p className="text-muted-foreground">Total du jour : <span className="font-bold text-primary">{formatMAD(totalJour)}</span></p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-rose text-primary-foreground shadow-soft">
              <Plus className="h-4 w-4 mr-2" /> Nouveau paiement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Enregistrer un paiement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>RDV du jour (optionnel)</Label>
                <Select value={form.rendezVousId} onValueChange={onSelectRdv}>
                  <SelectTrigger><SelectValue placeholder="Lier à un RDV" /></SelectTrigger>
                  <SelectContent>
                    {rdvs.filter(r => r.date === today).map(r => {
                      const c = clientes.find(cl => cl.id === r.clienteId);
                      const p = prestations.find(pr => pr.id === r.prestationId);
                      return <SelectItem key={r.id} value={r.id}>{r.heure} - {c?.nom} ({p?.nom})</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cliente *</Label>
                <Select value={form.clienteId} onValueChange={v => setForm({ ...form, clienteId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir une cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Montant (MAD) *</Label>
                <Input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: +e.target.value })} />
              </div>
              <div>
                <Label>Mode de paiement</Label>
                <Select value={form.modePaiement} onValueChange={(v) => setForm({ ...form, modePaiement: v as Paiement['modePaiement'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MODES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full gradient-rose text-primary-foreground">Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {paiements.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun paiement enregistré</p>
            </CardContent>
          </Card>
        ) : (
          paiements.map(p => {
            const cliente = clientes.find(c => c.id === p.clienteId);
            const ModeIcon = MODES[p.modePaiement]?.icon || CreditCard;
            return (
              <Card key={p.id} className="shadow-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                      <ModeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{cliente?.nom || 'Inconnue'}</p>
                      <p className="text-sm text-muted-foreground">{new Date(p.date).toLocaleDateString('fr-FR')} · {MODES[p.modePaiement]?.label}</p>
                    </div>
                  </div>
                  <p className="font-bold font-display text-primary">{formatMAD(p.montant)}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
