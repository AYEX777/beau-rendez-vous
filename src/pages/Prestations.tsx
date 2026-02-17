import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getPrestations, addPrestation, updatePrestation, deletePrestation, formatMAD } from "@/data/store";
import { Prestation } from "@/types";
import { Plus, Pencil, Trash2, Scissors } from "lucide-react";
import { toast } from "sonner";

export default function Prestations() {
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Prestation | null>(null);
  const [form, setForm] = useState({ nom: "", duree: 30, prix: 0, description: "", categorie: "" });

  const reload = () => setPrestations(getPrestations());
  useEffect(reload, []);

  const openNew = () => {
    setEditing(null);
    setForm({ nom: "", duree: 30, prix: 0, description: "", categorie: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: Prestation) => {
    setEditing(p);
    setForm({ nom: p.nom, duree: p.duree, prix: p.prix, description: p.description || "", categorie: p.categorie || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nom || form.prix <= 0) {
      toast.error("Le nom et un prix valide sont obligatoires");
      return;
    }
    if (editing) {
      updatePrestation(editing.id, form);
      toast.success("Prestation modifiée");
    } else {
      addPrestation(form);
      toast.success("Prestation ajoutée");
    }
    setDialogOpen(false);
    reload();
  };

  const handleDelete = (id: string) => {
    deletePrestation(id);
    toast.success("Prestation supprimée");
    reload();
  };

  const categories = [...new Set(prestations.map(p => p.categorie).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Prestations</h2>
          <p className="text-muted-foreground">{prestations.length} prestation{prestations.length > 1 ? 's' : ''}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-rose text-primary-foreground shadow-soft">
              <Plus className="h-4 w-4 mr-2" /> Nouvelle prestation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Modifier' : 'Nouvelle'} prestation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Nom *</Label>
                <Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Coupe femme" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Durée (min)</Label>
                  <Input type="number" value={form.duree} onChange={e => setForm({ ...form, duree: +e.target.value })} />
                </div>
                <div>
                  <Label>Prix (MAD) *</Label>
                  <Input type="number" value={form.prix} onChange={e => setForm({ ...form, prix: +e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Catégorie</Label>
                <Input value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} placeholder="Ex: Coupe, Couleur, Soin" />
              </div>
              <Button onClick={handleSave} className="w-full gradient-rose text-primary-foreground">
                {editing ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length > 0 ? (
        categories.map(cat => (
          <div key={cat}>
            <h3 className="font-display text-lg font-semibold mb-3 text-primary">{cat}</h3>
            <div className="grid gap-3">
              {prestations.filter(p => p.categorie === cat).map(p => (
                <PrestationCard key={p.id} p={p} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid gap-3">
          {prestations.map(p => (
            <PrestationCard key={p.id} p={p} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function PrestationCard({ p, onEdit, onDelete }: { p: Prestation; onEdit: (p: Prestation) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="shadow-card hover:shadow-soft transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
            <Scissors className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{p.nom}</p>
            <p className="text-sm text-muted-foreground">{p.duree} min · {formatMAD(p.prix)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(p)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(p.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
