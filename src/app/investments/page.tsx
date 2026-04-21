import { Card, CardContent } from '@/components/ui/card';

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <Card className="text-center py-20">
        <CardContent>
          <p className="text-4xl mb-4">📊</p>
          <h1 className="text-xl font-bold text-foreground mb-2">Inversiones</h1>
          <p className="text-sm text-muted-foreground">Próximamente...</p>
        </CardContent>
      </Card>
    </main>
  );
}
