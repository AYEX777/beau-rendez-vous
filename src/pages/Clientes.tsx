import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getClientes, addCliente, updateCliente, deleteCliente } from "@/data/store";
import { Cliente } from "@/types";
import { Plus, Search, Pencil, Trash2, User } from "lucide-react";
import { toast } from "sonner";

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nom: "", telephone: "", email: "", dateAnniversaire: "", notes: "" });

  const reload = () => setClientes(getClientes());
  useEffect(reload, []);

  const filtered = clientes.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) || c.telephone.includes(search)
  );

  const openNew = () => {
    setEditing(null);
    setForm({ nom: "", telephone: "", email: "", dateAnniversaire: "", notes: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setEditing(c);
    setForm({ nom: c.nom, telephone: c.telephone, email: c.email || "", dateAnniversaire: c.dateAnniversaire || "", notes: c.notes || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nom || !form.telephone) {
      toast.error("Le nom et le téléphone sont obligatoires");
      return;
    }
    if (editing) {
      updateCliente(editing.id, form);
      toast.success("Cliente modifiée");
    } else {
      addCliente(form);
      toast.success("Cliente ajoutée");
    }
    setDialogOpen(false);
    reload();
  };

  const handleDelete = (id: string) => {
    deleteCliente(id);
    toast.success("Cliente supprimée");
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Clientes</h2>
          <p className="text-muted-foreground">{clientes.length} cliente{clientes.length > 1 ? 's' : ''} enregistrée{clientes.length > 1 ? 's' : ''}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-rose text-primary-foreground shadow-soft">
              <Plus className="h-4 w-4 mr-2" /> Nouvelle cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Modifier' : 'Nouvelle'} cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Nom *</Label>
                <Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom complet" />
              </div>
              <div>
                <Label>Téléphone *</Label>
                <Input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="06..." />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com" />
              </div>
              <div>
                <Label>Date d'anniversaire</Label>
                <Input type="date" value={form.dateAnniversaire} onChange={e => setForm({ ...form, dateAnniversaire: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Préférences, allergies..." rows={2} />
              </div>
              <Button onClick={handleSave} className="w-full gradient-rose text-primary-foreground">
                {editing ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou téléphone..." className="pl-10" />
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucune cliente trouvée</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(c => (
            <Card key={c.id} className="shadow-card hover:shadow-soft transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full gradient-rose flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {c.nom.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{c.nom}</p>
                    <p className="text-sm text-muted-foreground">{c.telephone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
