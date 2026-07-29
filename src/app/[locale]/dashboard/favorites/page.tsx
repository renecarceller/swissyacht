import { FavoritesList } from "@/components/listings/favorites-list";
import { getPublicListingsAsync } from "@/lib/data/listings";
import { ui } from "@/i18n/ui";

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  const listings = await getPublicListingsAsync();
  const labels = favoritePageLabels(locale);

  return (
    <main className="container-shell py-8">
      <h1 className="text-3xl font-bold text-navy">{text.dashboard.favorites}</h1>
      <FavoritesList listings={listings} locale={locale} emptyTitle={labels.emptyTitle} emptyText={labels.emptyText} browseLabel={labels.browse} />
    </main>
  );
}

function favoritePageLabels(locale: string) {
  const labels = {
    fr: {
      emptyTitle: "Aucun bateau favori",
      emptyText: "Touchez le cœur sur une annonce pour l'ajouter ici et retrouver facilement vos bateaux préférés.",
      browse: "Voir les bateaux"
    },
    de: {
      emptyTitle: "Noch keine Favoriten",
      emptyText: "Tippen Sie bei einem Inserat auf das Herz, um es hier zu speichern.",
      browse: "Boote ansehen"
    },
    it: {
      emptyTitle: "Nessuna barca preferita",
      emptyText: "Tocca il cuore su un annuncio per salvarlo qui e ritrovarlo facilmente.",
      browse: "Vedi le barche"
    },
    en: {
      emptyTitle: "No favorite boats yet",
      emptyText: "Tap the heart on a listing to save it here and find it again easily.",
      browse: "View boats"
    }
  };

  return labels[locale as keyof typeof labels] ?? labels.fr;
}
