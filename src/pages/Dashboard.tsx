import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientes, getRendezVous, getPrestations, getPaiements, formatMAD } from "@/data/store";
import { Users, Calendar, TrendingUp, Scissors } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ clientes: 0, rdvAujourdhui: 0, caJour: 0, topPrestations: [] as { nom: string; count: number }[] });
  const [chartData, setChartData] = useState<{ jour: string; total: number }[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const clientes = getClientes();
    const rdvs = getRendezVous();
    const prestations = getPrestations();
    const paiements = getPaiements();

    const rdvAujourdhui = rdvs.filter(r => r.date === today);
    const caJour = paiements.filter(p => p.date === today).reduce((s, p) => s + p.montant, 0);

    // Top prestations
    const prestCount: Record<string, number> = {};
    rdvs.forEach(r => {
      prestCount[r.prestationId] = (prestCount[r.prestationId] || 0) + 1;
    });
    const topPrestations = Object.entries(prestCount)
      .map(([id, count]) => ({ nom: prestations.find(p => p.id === id)?.nom || 'Inconnu', count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({ clientes: clientes.length, rdvAujourdhui: rdvAujourdhui.length, caJour, topPrestations });

    // Chart: 7 derniers jours
    const days: { jour: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const total = paiements.filter(p => p.date === ds).reduce((s, p) => s + p.montant, 0);
      days.push({ jour: d.toLocaleDateString('fr-FR', { weekday: 'short' }), total });
    }
    setChartData(days);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-3xl font-bold text-foreground">Tableau de bord</h2>
        <p className="text-muted-foreground mt-1">Bienvenue dans votre espace de gestion</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Clientes" value={stats.clientes.toString()} />
        <StatCard icon={Calendar} label="RDV aujourd'hui" value={stats.rdvAujourdhui.toString()} />
        <StatCard icon={TrendingUp} label="CA du jour" value={formatMAD(stats.caJour)} />
        <StatCard icon={Scissors} label="Prestations" value={getPrestations().length.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Revenus (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="jour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatMAD(v)} />
                  <Bar dataKey="total" fill="hsl(340, 65%, 62%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Top prestations</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topPrestations.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun rendez-vous enregistré</p>
            ) : (
              <ul className="space-y-3">
                {stats.topPrestations.map((p, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.nom}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">{p.count} rdv</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="shadow-card hover:shadow-soft transition-shadow">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl gradient-rose flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold font-display">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
