import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getRendezVous, addRendezVous, updateRendezVous, deleteRendezVous, getClientes, getPrestations } from "@/data/store";
import { RendezVous } from "@/types";
import { Plus, ChevronLeft, ChevronRight, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

const STATUTS = {
  confirme: { label: "Confirmé", class: "bg-green-100 text-green-800" },
  en_attente: { label: "En attente", class: "bg-yellow-100 text-yellow-800" },
  annule: { label: "Annulé", class: "bg-red-100 text-red-800" },
  termine: { label: "Terminé", class: "bg-muted text-muted-foreground" },
};

export default function RendezVousPage() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ clienteId: "", prestationId: "", heure: "09:00", statut: "en_attente" as RendezVous['statut'], noteInterne: "" });

  const clientes = getClientes();
  const prestations = getPrestations();

  const reload = () => setRdvs(getRendezVous().filter(r => r.date === date).sort((a, b) => a.heure.localeCompare(b.heure)));
  useEffect(reload, [date]);

  const changeDate = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  const handleSave = () => {
    if (!form.clienteId || !form.prestationId) {
      toast.error("Cliente et prestation obligatoires");
      return;
    }
    // Vérifier conflit horaire
    const conflict = rdvs.find(r => r.heure === form.heure && r.statut !== 'annule');
    if (conflict) {
      toast.error("Conflit horaire ! Un RDV existe déjà à cette heure");
      return;
    }
    addRendezVous({ ...form, date });
    toast.success("Rendez-vous ajouté");
    setDialogOpen(false);
    setForm({ clienteId: "", prestationId: "", heure: "09:00", statut: "en_attente", noteInterne: "" });
    reload();
  };

  const changeStatut = (id: string, statut: RendezVous['statut']) => {
    updateRendezVous(id, { statut });
    toast.success("Statut modifié");
    reload();
  };

  const handleDelete = (id: string) => {
    deleteRendezVous(id);
    toast.success("RDV supprimé");
    reload();
  };

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Rendez-vous</h2>
          <p className="text-muted-foreground">{rdvs.length} rendez-vous ce jour</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-rose text-primary-foreground shadow-soft">
              <Plus className="h-4 w-4 mr-2" /> Nouveau RDV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Nouveau rendez-vous</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Cliente *</Label>
                <Select value={form.clienteId} onValueChange={v => setForm({ ...form, clienteId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir une cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nom} - {c.telephone}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prestation *</Label>
                <Select value={form.prestationId} onValueChange={v => setForm({ ...form, prestationId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir une prestation" /></SelectTrigger>
                  <SelectContent>
                    {prestations.map(p => <SelectItem key={p.id} value={p.id}>{p.nom} ({p.duree} min)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Heure</Label>
                <Input type="time" value={form.heure} onChange={e => setForm({ ...form, heure: e.target.value })} />
              </div>
              <div>
                <Label>Note interne</Label>
                <Textarea value={form.noteInterne} onChange={e => setForm({ ...form, noteInterne: e.target.value })} rows={2} />
              </div>
              <Button onClick={handleSave} className="w-full gradient-rose text-primary-foreground">Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Navigation date */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}><ChevronLeft className="h-5 w-5" /></Button>
        <div className="text-center">
          <p className="font-display text-lg font-semibold capitalize">{dateLabel}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => changeDate(1)}><ChevronRight className="h-5 w-5" /></Button>
      </div>

      <div className="grid gap-3">
        {rdvs.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun rendez-vous ce jour</p>
            </CardContent>
          </Card>
        ) : (
          rdvs.map(rv => {
            const cliente = clientes.find(c => c.id === rv.clienteId);
            const prestation = prestations.find(p => p.id === rv.prestationId);
            const s = STATUTS[rv.statut];
            return (
              <Card key={rv.id} className="shadow-card hover:shadow-soft transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[50px]">
                        <p className="text-lg font-bold font-display text-primary">{rv.heure}</p>
                      </div>
                      <div>
                        <p className="font-semibold">{cliente?.nom || 'Cliente inconnue'}</p>
                        <p className="text-sm text-muted-foreground">{prestation?.nom || 'Prestation inconnue'}</p>
                        {rv.noteInterne && <p className="text-xs text-muted-foreground mt-1 italic">"{rv.noteInterne}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={rv.statut} onValueChange={(v) => changeStatut(rv.id, v as RendezVous['statut'])}>
                        <SelectTrigger className="w-auto h-auto p-0 border-0">
                          <Badge className={s.class}>{s.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUTS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rv.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
