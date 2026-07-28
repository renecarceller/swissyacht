"use client";

import { Building2, Check, ShipWheel, UserRound } from "lucide-react";
import { useState } from "react";
import { registerPrivateAccountAction, registerProfessionalAccountAction } from "@/lib/actions/auth";
import { cantons } from "@/lib/data/reference";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { ui } from "@/i18n/ui";

const brokerServices = [
  "Compra de barcos",
  "Venta de barcos",
  "Brokerage",
  "Alquiler",
  "Financiacion",
  "Leasing",
  "Seguros",
  "Transporte",
  "Mantenimiento",
  "Reparacion",
  "Invernaje",
  "Amarres"
];

export function RegisterAccountForm({ locale, compact = false }: { locale: string; compact?: boolean }) {
  const [accountType, setAccountType] = useState<"private" | "professional" | null>(null);
  const text = ui(locale);
  const labels = registerLabels(locale);

  if (!accountType) {
    return (
      <section className={cn("mx-auto grid gap-6", compact ? "max-w-4xl" : "max-w-5xl")}>
        <div className="text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#0f6fae]">SwissYacht</p>
          <h1 className={cn("font-bold text-navy", compact ? "text-2xl md:text-3xl" : "text-3xl")}>{labels.choiceTitle}</h1>
          <p className="mt-2 text-[#607085]">{labels.choiceIntro}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <ChoiceCard
            icon={<UserRound />}
            title={labels.privateTitle}
            text={labels.privateText}
            features={[labels.fastRegister, labels.simplePublish, labels.manageListings]}
            button={labels.privateButton}
            onClick={() => setAccountType("private")}
          />
          <ChoiceCard
            icon={<Building2 />}
            title={labels.proTitle}
            text={labels.proText}
            features={[labels.publicCompany, labels.catalog, labels.proDashboard]}
            button={labels.proButton}
            onClick={() => setAccountType("professional")}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl">
      <button type="button" onClick={() => setAccountType(null)} className="mb-4 text-sm font-semibold text-[#0f6fae]">
        {labels.changeType}
      </button>
      {accountType === "private" ? (
        <form action={registerPrivateAccountAction} className={cn("rounded-md border border-[#d9e2ec] bg-white", compact ? "p-4 md:p-5" : "p-6")}>
          <input type="hidden" name="locale" value={locale} />
          <h1 className="mb-5 flex items-center gap-2 text-2xl font-bold text-navy"><UserRound />{labels.privateRegister}</h1>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={labels.firstName}><Input name="firstName" required /></Field>
            <Field label={labels.lastName}><Input name="lastName" required /></Field>
            <Field label={text.common.email}><Input type="email" name="email" required /></Field>
            <Field label={text.common.phone}><Input name="phone" required /></Field>
            <Field label={text.common.password}><Input type="password" name="password" required minLength={8} /></Field>
          </div>
          <Button className="mt-6 bg-[#8bd3ff] text-[#06233f] shadow-[0_4px_0_#58b9e8] hover:bg-[#aee2ff]">{labels.createPrivate}</Button>
        </form>
      ) : (
        <form action={registerProfessionalAccountAction} className={cn("grid", compact ? "gap-3" : "gap-5")}>
          <input type="hidden" name="locale" value={locale} />
          <Step title={labels.accessData}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={labels.firstName}><Input name="firstName" required /></Field>
              <Field label={labels.lastName}><Input name="lastName" required /></Field>
              <Field label={text.common.email}><Input type="email" name="email" required /></Field>
              <Field label={text.common.phone}><Input name="phone" required /></Field>
              <Field label={text.common.password}><Input type="password" name="password" required minLength={8} /></Field>
              <Field label={labels.language}>
                <Select name="preferredLocale" defaultValue={locale}>
                  <option value="fr">FR</option>
                  <option value="de">DE</option>
                  <option value="it">IT</option>
                  <option value="en">EN</option>
                </Select>
              </Field>
            </div>
          </Step>
          <Step title={labels.companyData}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={labels.companyName}><Input name="companyName" required /></Field>
              <Field label={labels.logo}><Input name="logoUrl" type="url" placeholder="https://..." /></Field>
              <Field label={labels.cover}><Input name="coverUrl" type="url" placeholder="https://..." /></Field>
              <Field label={labels.website}><Input name="website" type="url" placeholder="https://..." /></Field>
              <Field label={labels.address}><Input name="addressLine" required /></Field>
              <Field label={labels.postalCode}><Input name="postalCode" required /></Field>
              <Field label={text.common.city}><Input name="city" required /></Field>
              <Field label={text.common.canton}><Select name="canton">{cantons.map((canton) => <option key={canton}>{canton}</option>)}</Select></Field>
              <Field label={labels.country}><Input name="country" defaultValue="Switzerland" required /></Field>
              <Field label={text.common.phone}><Input name="publicPhone" /></Field>
              <Field label={text.common.email}><Input type="email" name="publicEmail" required /></Field>
            </div>
          </Step>
          <Step title={labels.publicPresentation}>
            <div className="grid gap-4">
              <Field label={text.common.description}><Textarea name="description" rows={5} /></Field>
              <Field label={labels.openingHours}><Textarea name="openingHours" rows={3} /></Field>
              <div>
                <div className="mb-2 text-sm font-semibold text-navy">{labels.languages}</div>
                <div className="flex flex-wrap gap-3">
                  {["fr", "de", "it", "en"].map((language) => (
                    <label key={language} className="rounded-md border border-[#d9e2ec] bg-white px-3 py-2 text-sm font-semibold">
                      <input type="checkbox" name="languages" value={language} defaultChecked={language === locale} className="mr-2" />
                      {language.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold text-navy">{labels.services}</div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {brokerServices.map((service) => (
                    <label key={service} className="rounded-md border border-[#d9e2ec] bg-white px-3 py-2 text-sm">
                      <input type="checkbox" name="services" value={service} className="mr-2" />
                      {service}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Step>
          <div className="rounded-md border border-[#d9e2ec] bg-white p-5 text-right">
            <Button className="bg-[#8bd3ff] text-[#06233f] shadow-[0_4px_0_#58b9e8] hover:bg-[#aee2ff]">{labels.createProfessional}</Button>
          </div>
        </form>
      )}
    </section>
  );
}

function ChoiceCard({ icon, title, text, features, button, onClick }: { icon: React.ReactNode; title: string; text: string; features: string[]; button: string; onClick: () => void }) {
  return (
    <article className="rounded-md border border-[#d9e2ec] bg-white/95 p-5 shadow-sm ring-1 ring-white/80 backdrop-blur">
      <div className="mb-4 flex size-12 items-center justify-center rounded-md bg-[#e8f6ff] text-[#0b6fae] [&>svg]:size-7">{icon}</div>
      <h2 className="text-2xl font-bold text-navy">{title}</h2>
      <p className="mt-2 text-[#607085]">{text}</p>
      <div className="mt-5 grid gap-2">
        {features.map((feature) => (
          <span key={feature} className="flex items-center gap-2 text-sm font-semibold text-[#324963]"><Check size={16} className="text-[#0f6fae]" />{feature}</span>
        ))}
      </div>
      <Button type="button" onClick={onClick} className="mt-6 w-full bg-[#8bd3ff] text-[#06233f] shadow-[0_4px_0_#58b9e8] hover:bg-[#aee2ff]">
        <ShipWheel size={16} />
        {button}
      </Button>
    </article>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-[#d9e2ec] bg-white p-5">
      <h2 className="mb-5 text-xl font-bold text-navy">{title}</h2>
      {children}
    </section>
  );
}

function registerLabels(locale: string) {
  const dictionaries = {
    fr: {
      choiceTitle: "Quel type de compte souhaitez-vous créer ?",
      choiceIntro: "Choisissez le compte adapté à votre activité nautique.",
      privateTitle: "Particulier",
      privateText: "Pour les personnes qui veulent vendre leur propre bateau.",
      proTitle: "Broker / Professionnel",
      proText: "Pour brokers, concessionnaires, marinas et entreprises nautiques.",
      fastRegister: "Inscription rapide",
      simplePublish: "Publication simple",
      manageListings: "Gestion des annonces",
      publicCompany: "Profil public de l'entreprise",
      catalog: "Catalogue complet",
      proDashboard: "Tableau de bord professionnel",
      privateButton: "Continuer comme particulier",
      proButton: "Continuer comme professionnel",
      changeType: "Changer de type de compte",
      privateRegister: "Compte particulier",
      firstName: "Prénom",
      lastName: "Nom",
      createPrivate: "Créer mon compte",
      accessData: "Données d'accès",
      companyData: "Informations de l'entreprise",
      publicPresentation: "Présentation publique",
      language: "Langue",
      companyName: "Nom de l'entreprise",
      logo: "Logo",
      cover: "Image de couverture",
      website: "Page web",
      address: "Adresse",
      postalCode: "Code postal",
      country: "Pays",
      openingHours: "Horaires",
      languages: "Langues",
      services: "Services offerts",
      createProfessional: "Créer le compte professionnel"
    },
    de: {
      choiceTitle: "Welche Kontoart möchten Sie erstellen?",
      choiceIntro: "Wählen Sie das passende Konto für Ihre nautische Aktivität.",
      privateTitle: "Privat",
      privateText: "Für Personen, die ihr eigenes Boot verkaufen möchten.",
      proTitle: "Broker / Profi",
      proText: "Für Broker, Händler, Marinas und nautische Unternehmen.",
      fastRegister: "Schnelle Registrierung",
      simplePublish: "Einfaches Inserieren",
      manageListings: "Inserate verwalten",
      publicCompany: "Öffentliches Firmenprofil",
      catalog: "Kompletter Katalog",
      proDashboard: "Profi-Dashboard",
      privateButton: "Als Privatperson weiter",
      proButton: "Als Profi weiter",
      changeType: "Kontoart wechseln",
      privateRegister: "Privatkonto",
      firstName: "Vorname",
      lastName: "Nachname",
      createPrivate: "Konto erstellen",
      accessData: "Zugangsdaten",
      companyData: "Unternehmensdaten",
      publicPresentation: "Öffentliche Präsentation",
      language: "Sprache",
      companyName: "Firmenname",
      logo: "Logo",
      cover: "Titelbild",
      website: "Webseite",
      address: "Adresse",
      postalCode: "Postleitzahl",
      country: "Land",
      openingHours: "Öffnungszeiten",
      languages: "Sprachen",
      services: "Angebotene Services",
      createProfessional: "Profi-Konto erstellen"
    },
    it: {
      choiceTitle: "Che tipo di account desidera creare?",
      choiceIntro: "Scegli l'account adatto alla tua attività nautica.",
      privateTitle: "Privato",
      privateText: "Per persone che vogliono vendere la propria barca.",
      proTitle: "Broker / Professionista",
      proText: "Per broker, concessionari, marine e aziende nautiche.",
      fastRegister: "Registrazione rapida",
      simplePublish: "Pubblicazione semplice",
      manageListings: "Gestione annunci",
      publicCompany: "Profilo pubblico aziendale",
      catalog: "Catalogo completo",
      proDashboard: "Pannello professionale",
      privateButton: "Continua come privato",
      proButton: "Continua come professionista",
      changeType: "Cambia tipo di account",
      privateRegister: "Account privato",
      firstName: "Nome",
      lastName: "Cognome",
      createPrivate: "Crea account",
      accessData: "Dati di accesso",
      companyData: "Informazioni azienda",
      publicPresentation: "Presentazione pubblica",
      language: "Lingua",
      companyName: "Nome azienda",
      logo: "Logo",
      cover: "Immagine di copertina",
      website: "Sito web",
      address: "Indirizzo",
      postalCode: "Codice postale",
      country: "Paese",
      openingHours: "Orari",
      languages: "Lingue",
      services: "Servizi offerti",
      createProfessional: "Crea account professionale"
    },
    en: {
      choiceTitle: "What type of account would you like to create?",
      choiceIntro: "Choose the account that fits your boating activity.",
      privateTitle: "Private seller",
      privateText: "For people who want to sell their own boat.",
      proTitle: "Broker / Professional",
      proText: "For brokers, dealers, marinas and marine businesses.",
      fastRegister: "Fast registration",
      simplePublish: "Simple publishing",
      manageListings: "Listing management",
      publicCompany: "Public company profile",
      catalog: "Complete catalogue",
      proDashboard: "Professional dashboard",
      privateButton: "Continue as private seller",
      proButton: "Continue as professional",
      changeType: "Change account type",
      privateRegister: "Private account",
      firstName: "First name",
      lastName: "Last name",
      createPrivate: "Create my account",
      accessData: "Access details",
      companyData: "Company information",
      publicPresentation: "Public presentation",
      language: "Language",
      companyName: "Company name",
      logo: "Logo",
      cover: "Cover image",
      website: "Website",
      address: "Address",
      postalCode: "Postal code",
      country: "Country",
      openingHours: "Opening hours",
      languages: "Languages",
      services: "Services offered",
      createProfessional: "Create professional account"
    }
  };

  return dictionaries[locale as keyof typeof dictionaries] ?? dictionaries.fr;
}
