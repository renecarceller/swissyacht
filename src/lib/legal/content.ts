import type { Locale } from "@/types/domain";

export type LegalPageSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPageContent = {
  title: string;
  intro: string;
  sections: LegalPageSection[];
};

export const legalDocumentVersion = "2026-08-29";

const operator = {
  siteName: "Swissnaut",
  host: "Vercel",
  dataProvider: "Supabase"
};

const sharedPages = {
  fr: {
    "legal-notice": {
      title: "Mentions légales",
      intro: "Ces mentions présentent le cadre d'utilisation de Swissnaut, marketplace nautique destinée au marché suisse.",
      sections: [
        { heading: "Exploitant du service", paragraphs: [`${operator.siteName} est le nom du service en ligne consacré aux annonces nautiques en Suisse. Les demandes relatives au site peuvent être envoyées par les formulaires et espaces de contact disponibles sur la plateforme.`] },
        { heading: "Rôle de Swissnaut", paragraphs: ["Swissnaut met en relation acheteurs, vendeurs particuliers, brokers et professionnels. Swissnaut n'est pas partie au contrat de vente conclu entre utilisateurs."] },
        { heading: "Responsabilité des annonces", paragraphs: ["Chaque vendeur reste responsable de l'exactitude des informations, prix, photos, disponibilités, documents et caractéristiques publiés."] },
        { heading: "Hébergement et données", paragraphs: [`L'application est hébergée sur ${operator.host}. L'authentification, la base de données et le stockage d'images utilisent ${operator.dataProvider}.`] },
        { heading: "Propriété intellectuelle", paragraphs: ["La marque, l'interface, les textes et les éléments visuels propres à Swissnaut ne peuvent pas être copiés sans autorisation. Les utilisateurs doivent disposer des droits sur les contenus qu'ils publient."] }
      ]
    },
    terms: {
      title: "Conditions générales",
      intro: "Ces conditions encadrent l'utilisation de Swissnaut par les visiteurs, acheteurs, vendeurs particuliers, brokers et professionnels.",
      sections: [
        { heading: "Acceptation", paragraphs: ["La création d'un compte, l'envoi d'un message ou la publication d'une annonce implique l'acceptation des présentes conditions et la prise de connaissance de la politique de confidentialité."] },
        { heading: "Comptes", paragraphs: ["Les informations de compte doivent être exactes. L'utilisateur est responsable de ses identifiants et des actions réalisées depuis son compte."] },
        { heading: "Annonces", bullets: ["Les annonces doivent décrire une embarcation réelle.", "Les photos doivent représenter l'embarcation proposée.", "Les prix sont affichés en CHF.", "Swissnaut peut retirer ou suspendre une annonce abusive, trompeuse ou dangereuse."] },
        { heading: "Vente", paragraphs: ["La négociation, le paiement, la livraison, les garanties, l'immatriculation et les documents sont convenus directement entre acheteur et vendeur."] },
        { heading: "Services futurs", paragraphs: ["La plateforme est préparée pour des options payantes futures, mais aucun paiement n'est actif tant qu'il n'est pas présenté et accepté explicitement."] }
      ]
    },
    privacy: {
      title: "Politique de confidentialité",
      intro: "Cette politique explique les données traitées pour les comptes, annonces, profils professionnels, favoris, messages et fonctions de sécurité.",
      sections: [
        { heading: "Données traitées", paragraphs: ["Swissnaut peut traiter les données de compte, données professionnelles, annonces, photos, favoris, messages internes et informations techniques nécessaires au service."] },
        { heading: "Finalités", bullets: ["Créer et sécuriser les comptes.", "Publier et rechercher des annonces.", "Permettre la messagerie entre acheteurs et vendeurs.", "Prévenir les abus et améliorer la stabilité du service."] },
        { heading: "Prestataires", paragraphs: [`${operator.dataProvider} est utilisé pour l'authentification, la base de données et le stockage. ${operator.host} est utilisé pour l'hébergement et les journaux techniques.`] },
        { heading: "Droits", paragraphs: ["Selon le droit applicable, l'utilisateur peut demander l'accès, la rectification, la suppression ou la limitation de certaines données via les moyens de contact de Swissnaut."] }
      ]
    },
    cookies: {
      title: "Cookies",
      intro: "Swissnaut utilise les cookies et stockages nécessaires au fonctionnement actuel de la plateforme.",
      sections: [
        { heading: "Cookies nécessaires", paragraphs: ["Ils permettent l'authentification, la sécurité, la session et les préférences de navigation indispensables au service."] },
        { heading: "Préférences locales", paragraphs: ["Certaines préférences comme les favoris ou l'affichage peuvent être conservées localement dans le navigateur."] },
        { heading: "Mesure d'audience", paragraphs: ["Aucun outil publicitaire ou mesure d'audience externe n'est activé dans le fonctionnement actuellement visible de l'application."] }
      ]
    },
    fraud: {
      title: "Sécurité et prévention de la fraude",
      intro: "Swissnaut encourage les utilisateurs à vérifier chaque annonce avant tout engagement.",
      sections: [
        { heading: "Conseils", bullets: ["Ne payez pas avant d'avoir vérifié le bateau et les documents.", "Méfiez-vous des prix anormalement bas.", "Échangez dans la messagerie Swissnaut lorsque c'est possible.", "Signalez tout comportement suspect."] },
        { heading: "Intervention", paragraphs: ["Swissnaut peut suspendre un compte ou retirer une annonce lorsqu'un risque de fraude ou d'abus est détecté."] }
      ]
    },
    "publishing-rules": {
      title: "Règles de publication",
      intro: "Ces règles aident à garder les annonces claires, utiles et fiables.",
      sections: [
        { heading: "Contenu autorisé", bullets: ["Une annonce doit concerner une embarcation réelle.", "La marque, le modèle, l'année, le prix, l'état et la localisation doivent être cohérents.", "Les photos doivent montrer le bateau concerné."] },
        { heading: "Contenu interdit", bullets: ["Annonces fictives.", "Photos copiées sans droit.", "Informations trompeuses.", "Spam, fraude ou collecte abusive de données."] }
      ]
    },
    contact: {
      title: "Contact",
      intro: "Les demandes liées à Swissnaut peuvent être envoyées depuis les espaces de contact disponibles sur la plateforme.",
      sections: [
        { heading: "Support", paragraphs: ["Pour une question de compte, d'annonce, de sécurité ou de données, utilisez les formulaires et messages disponibles dans Swissnaut."] },
        { heading: "Signalement", paragraphs: ["Les annonces ou messages suspects doivent être signalés afin de permettre un contrôle."] }
      ]
    }
  },
  de: {
    "legal-notice": {
      title: "Impressum",
      intro: "Diese Hinweise beschreiben die Nutzung von Swissnaut, dem Bootsmarktplatz für den Schweizer Markt.",
      sections: [
        { heading: "Betreiber des Dienstes", paragraphs: [`${operator.siteName} ist der Name des Online-Dienstes für nautische Inserate in der Schweiz. Anfragen können über die Kontaktbereiche der Plattform gesendet werden.`] },
        { heading: "Rolle von Swissnaut", paragraphs: ["Swissnaut verbindet Käufer, private Verkäufer, Broker und professionelle Anbieter. Swissnaut ist nicht Partei des Kaufvertrags zwischen Nutzern."] },
        { heading: "Verantwortung für Inserate", paragraphs: ["Jeder Verkäufer ist für korrekte Angaben, Preise, Fotos, Verfügbarkeiten, Dokumente und technische Merkmale verantwortlich."] },
        { heading: "Hosting und Daten", paragraphs: [`Die Anwendung wird auf ${operator.host} gehostet. Authentifizierung, Datenbank und Bildspeicher nutzen ${operator.dataProvider}.`] },
        { heading: "Geistiges Eigentum", paragraphs: ["Marke, Oberfläche, Texte und eigene visuelle Elemente von Swissnaut dürfen nicht ohne Erlaubnis kopiert werden. Nutzer müssen die Rechte an veröffentlichten Inhalten besitzen."] }
      ]
    },
    terms: {
      title: "Allgemeine Bedingungen",
      intro: "Diese Bedingungen regeln die Nutzung von Swissnaut durch Besucher, Käufer, private Verkäufer, Broker und professionelle Anbieter.",
      sections: [
        { heading: "Annahme", paragraphs: ["Mit Kontoerstellung, Nachrichtversand oder Inseratveröffentlichung akzeptiert der Nutzer diese Bedingungen und nimmt die Datenschutzerklärung zur Kenntnis."] },
        { heading: "Konten", paragraphs: ["Kontoinformationen müssen korrekt sein. Nutzer sind für ihre Zugangsdaten und Handlungen über ihr Konto verantwortlich."] },
        { heading: "Inserate", bullets: ["Inserate müssen ein reales Boot beschreiben.", "Fotos müssen das angebotene Boot zeigen.", "Preise werden in CHF angezeigt.", "Swissnaut kann missbräuchliche, irreführende oder gefährliche Inserate entfernen oder sperren."] },
        { heading: "Verkauf", paragraphs: ["Verhandlung, Zahlung, Übergabe, Garantien, Registrierung und Dokumente werden direkt zwischen Käufer und Verkäufer vereinbart."] },
        { heading: "Künftige Dienste", paragraphs: ["Die Plattform ist für künftige kostenpflichtige Optionen vorbereitet; Zahlungen sind erst aktiv, wenn sie ausdrücklich angeboten und akzeptiert werden."] }
      ]
    },
    privacy: {
      title: "Datenschutzerklärung",
      intro: "Diese Erklärung beschreibt Datenverarbeitungen für Konten, Inserate, Profiprofile, Favoriten, Nachrichten und Sicherheit.",
      sections: [
        { heading: "Verarbeitete Daten", paragraphs: ["Swissnaut kann Konto-, Berufsprofil-, Inserats-, Foto-, Favoriten-, Nachrichten- und technische Daten verarbeiten, die für den Dienst erforderlich sind."] },
        { heading: "Zwecke", bullets: ["Konten erstellen und schützen.", "Inserate veröffentlichen und suchen.", "Nachrichten zwischen Käufern und Verkäufern ermöglichen.", "Missbrauch verhindern und Stabilität verbessern."] },
        { heading: "Dienstleister", paragraphs: [`${operator.dataProvider} wird für Authentifizierung, Datenbank und Speicher verwendet. ${operator.host} wird für Hosting und technische Protokolle verwendet.`] },
        { heading: "Rechte", paragraphs: ["Je nach anwendbarem Recht können Nutzer Zugriff, Berichtigung, Löschung oder Einschränkung bestimmter Daten über die Kontaktwege von Swissnaut verlangen."] }
      ]
    },
    cookies: {
      title: "Cookies",
      intro: "Swissnaut verwendet Cookies und Speicher, die für den aktuellen Betrieb der Plattform notwendig sind.",
      sections: [
        { heading: "Notwendige Cookies", paragraphs: ["Sie ermöglichen Authentifizierung, Sicherheit, Sitzung und wesentliche Navigationseinstellungen."] },
        { heading: "Lokale Einstellungen", paragraphs: ["Einige Einstellungen wie Favoriten oder Anzeigeoptionen können lokal im Browser gespeichert werden."] },
        { heading: "Analyse", paragraphs: ["In der aktuell sichtbaren Anwendung ist kein externer Werbe- oder Analytics-Dienst aktiv."] }
      ]
    },
    fraud: { title: "Sicherheit und Betrugsprävention", intro: "Swissnaut empfiehlt, jedes Inserat vor einer Verpflichtung sorgfältig zu prüfen.", sections: [{ heading: "Hinweise", bullets: ["Zahlen Sie nicht vor Prüfung von Boot und Dokumenten.", "Seien Sie vorsichtig bei ungewöhnlich tiefen Preisen.", "Nutzen Sie wenn möglich die Swissnaut-Nachrichten.", "Melden Sie verdächtiges Verhalten."] }, { heading: "Massnahmen", paragraphs: ["Swissnaut kann Konten sperren oder Inserate entfernen, wenn Betrugs- oder Missbrauchsrisiken erkannt werden."] }] },
    "publishing-rules": { title: "Inseratsregeln", intro: "Diese Regeln halten Inserate klar, nützlich und vertrauenswürdig.", sections: [{ heading: "Erlaubte Inhalte", bullets: ["Ein Inserat muss ein reales Boot betreffen.", "Marke, Modell, Jahr, Preis, Zustand und Standort müssen stimmig sein.", "Fotos müssen das betreffende Boot zeigen."] }, { heading: "Verbotene Inhalte", bullets: ["Fiktive Inserate.", "Fotos ohne Nutzungsrecht.", "Irreführende Angaben.", "Spam, Betrug oder missbräuchliche Datensammlung."] }] },
    contact: { title: "Kontakt", intro: "Anfragen zu Swissnaut können über die Kontaktbereiche der Plattform gesendet werden.", sections: [{ heading: "Support", paragraphs: ["Nutzen Sie für Konto-, Inserats-, Sicherheits- oder Datenfragen die Formulare und Nachrichten in Swissnaut."] }, { heading: "Meldung", paragraphs: ["Verdächtige Inserate oder Nachrichten sollten gemeldet werden, damit eine Prüfung möglich ist."] }] }
  },
  it: {
    "legal-notice": {
      title: "Note legali",
      intro: "Queste note descrivono l'uso di Swissnaut, marketplace nautico destinato al mercato svizzero.",
      sections: [
        { heading: "Gestore del servizio", paragraphs: [`${operator.siteName} è il nome del servizio online dedicato agli annunci nautici in Svizzera. Le richieste possono essere inviate tramite le aree di contatto della piattaforma.`] },
        { heading: "Ruolo di Swissnaut", paragraphs: ["Swissnaut mette in contatto acquirenti, venditori privati, broker e professionisti. Swissnaut non è parte del contratto di vendita tra utenti."] },
        { heading: "Responsabilità degli annunci", paragraphs: ["Ogni venditore è responsabile di informazioni, prezzi, foto, disponibilità, documenti e caratteristiche pubblicate."] },
        { heading: "Hosting e dati", paragraphs: [`L'applicazione è ospitata su ${operator.host}. Autenticazione, database e archiviazione immagini utilizzano ${operator.dataProvider}.`] },
        { heading: "Proprietà intellettuale", paragraphs: ["Marchio, interfaccia, testi ed elementi visivi di Swissnaut non possono essere copiati senza autorizzazione. Gli utenti devono possedere i diritti sui contenuti pubblicati."] }
      ]
    },
    terms: {
      title: "Condizioni generali",
      intro: "Queste condizioni regolano l'utilizzo di Swissnaut da parte di visitatori, acquirenti, venditori privati, broker e professionisti.",
      sections: [
        { heading: "Accettazione", paragraphs: ["La creazione di un account, l'invio di un messaggio o la pubblicazione di un annuncio implica l'accettazione delle condizioni e la presa visione della privacy policy."] },
        { heading: "Account", paragraphs: ["Le informazioni dell'account devono essere corrette. L'utente è responsabile delle proprie credenziali e delle azioni effettuate dal suo account."] },
        { heading: "Annunci", bullets: ["Gli annunci devono descrivere un'imbarcazione reale.", "Le foto devono rappresentare l'imbarcazione proposta.", "I prezzi sono indicati in CHF.", "Swissnaut può rimuovere o sospendere annunci abusivi, ingannevoli o pericolosi."] },
        { heading: "Vendita", paragraphs: ["Negoziazione, pagamento, consegna, garanzie, immatricolazione e documenti sono concordati direttamente tra acquirente e venditore."] },
        { heading: "Servizi futuri", paragraphs: ["La piattaforma è predisposta per opzioni a pagamento future, ma nessun pagamento è attivo finché non viene presentato e accettato esplicitamente."] }
      ]
    },
    privacy: {
      title: "Privacy policy",
      intro: "Questa policy spiega i dati trattati per account, annunci, profili professionali, preferiti, messaggi e sicurezza.",
      sections: [
        { heading: "Dati trattati", paragraphs: ["Swissnaut può trattare dati account, dati professionali, annunci, foto, preferiti, messaggi interni e dati tecnici necessari al servizio."] },
        { heading: "Finalità", bullets: ["Creare e proteggere gli account.", "Pubblicare e cercare annunci.", "Consentire la messaggistica tra acquirenti e venditori.", "Prevenire abusi e migliorare la stabilità."] },
        { heading: "Fornitori", paragraphs: [`${operator.dataProvider} è usato per autenticazione, database e storage. ${operator.host} è usato per hosting e log tecnici.`] },
        { heading: "Diritti", paragraphs: ["Secondo la legge applicabile, l'utente può chiedere accesso, rettifica, cancellazione o limitazione di alcuni dati tramite i contatti di Swissnaut."] }
      ]
    },
    cookies: { title: "Cookie", intro: "Swissnaut usa cookie e archiviazioni necessari al funzionamento attuale della piattaforma.", sections: [{ heading: "Cookie necessari", paragraphs: ["Permettono autenticazione, sicurezza, sessione e preferenze essenziali di navigazione."] }, { heading: "Preferenze locali", paragraphs: ["Alcune preferenze come preferiti o visualizzazione possono essere salvate localmente nel browser."] }, { heading: "Analisi", paragraphs: ["Nell'applicazione attualmente visibile non è attivo alcuno strumento esterno pubblicitario o di analytics."] }] },
    fraud: { title: "Sicurezza e prevenzione frodi", intro: "Swissnaut invita gli utenti a verificare ogni annuncio prima di impegnarsi.", sections: [{ heading: "Consigli", bullets: ["Non pagare prima di verificare barca e documenti.", "Diffidare dei prezzi anormalmente bassi.", "Usare la messaggistica Swissnaut quando possibile.", "Segnalare comportamenti sospetti."] }, { heading: "Intervento", paragraphs: ["Swissnaut può sospendere account o rimuovere annunci quando rileva rischi di frode o abuso."] }] },
    "publishing-rules": { title: "Regole di pubblicazione", intro: "Queste regole mantengono gli annunci chiari, utili e affidabili.", sections: [{ heading: "Contenuti consentiti", bullets: ["Un annuncio deve riguardare un'imbarcazione reale.", "Marca, modello, anno, prezzo, stato e luogo devono essere coerenti.", "Le foto devono mostrare la barca interessata."] }, { heading: "Contenuti vietati", bullets: ["Annunci fittizi.", "Foto copiate senza diritto.", "Informazioni ingannevoli.", "Spam, frode o raccolta abusiva di dati."] }] },
    contact: { title: "Contatto", intro: "Le richieste relative a Swissnaut possono essere inviate tramite le aree di contatto della piattaforma.", sections: [{ heading: "Supporto", paragraphs: ["Per domande su account, annunci, sicurezza o dati, usare moduli e messaggi disponibili in Swissnaut."] }, { heading: "Segnalazione", paragraphs: ["Annunci o messaggi sospetti devono essere segnalati per permettere un controllo."] }] }
  },
  en: {
    "legal-notice": {
      title: "Legal notice",
      intro: "This notice describes the use of Swissnaut, a nautical marketplace for the Swiss market.",
      sections: [
        { heading: "Service operator", paragraphs: [`${operator.siteName} is the name of the online service dedicated to nautical listings in Switzerland. Requests can be sent through the contact areas available on the platform.`] },
        { heading: "Role of Swissnaut", paragraphs: ["Swissnaut connects buyers, private sellers, brokers and professionals. Swissnaut is not a party to the sales contract between users."] },
        { heading: "Listing responsibility", paragraphs: ["Each seller remains responsible for the accuracy of information, prices, photos, availability, documents and characteristics published in their listings."] },
        { heading: "Hosting and data", paragraphs: [`The application is hosted on ${operator.host}. Authentication, database and image storage use ${operator.dataProvider}.`] },
        { heading: "Intellectual property", paragraphs: ["Swissnaut's brand, interface, texts and visual elements may not be copied without permission. Users must hold the rights to the content they publish."] }
      ]
    },
    terms: {
      title: "Terms and conditions",
      intro: "These terms govern the use of Swissnaut by visitors, buyers, private sellers, brokers and professionals.",
      sections: [
        { heading: "Acceptance", paragraphs: ["Creating an account, sending a message or publishing a listing means accepting these terms and acknowledging the privacy policy."] },
        { heading: "Accounts", paragraphs: ["Account information must be accurate. Users are responsible for their credentials and for actions carried out from their account."] },
        { heading: "Listings", bullets: ["Listings must describe a real boat.", "Photos must show the offered boat.", "Prices are displayed in CHF.", "Swissnaut may remove or suspend abusive, misleading or unsafe listings."] },
        { heading: "Sale", paragraphs: ["Negotiation, payment, delivery, warranties, registration and documents are agreed directly between buyer and seller."] },
        { heading: "Future services", paragraphs: ["The platform is prepared for future paid options, but no payment is active until it is clearly presented and accepted."] }
      ]
    },
    privacy: {
      title: "Privacy policy",
      intro: "This policy explains the data processed for accounts, listings, professional profiles, favourites, messages and security features.",
      sections: [
        { heading: "Processed data", paragraphs: ["Swissnaut may process account data, professional profile data, listings, photos, favourites, internal messages and technical data required for the service."] },
        { heading: "Purposes", bullets: ["Create and secure accounts.", "Publish and search listings.", "Enable messaging between buyers and sellers.", "Prevent abuse and improve service stability."] },
        { heading: "Providers", paragraphs: [`${operator.dataProvider} is used for authentication, database and storage. ${operator.host} is used for hosting and technical logs.`] },
        { heading: "Rights", paragraphs: ["Depending on applicable law, users may request access, correction, deletion or restriction of certain data through Swissnaut's contact options."] }
      ]
    },
    cookies: { title: "Cookies", intro: "Swissnaut uses cookies and storage needed for the current operation of the platform.", sections: [{ heading: "Necessary cookies", paragraphs: ["They enable authentication, security, sessions and essential navigation preferences."] }, { heading: "Local preferences", paragraphs: ["Some preferences such as favourites or display options may be stored locally in the browser."] }, { heading: "Analytics", paragraphs: ["No external advertising or analytics tool is active in the currently visible application."] }] },
    fraud: { title: "Security and fraud prevention", intro: "Swissnaut encourages users to verify every listing before making any commitment.", sections: [{ heading: "Advice", bullets: ["Do not pay before checking the boat and documents.", "Be careful with unusually low prices.", "Use Swissnaut messaging where possible.", "Report suspicious behaviour."] }, { heading: "Action", paragraphs: ["Swissnaut may suspend accounts or remove listings when fraud or abuse risks are detected."] }] },
    "publishing-rules": { title: "Publishing rules", intro: "These rules keep listings clear, useful and trustworthy.", sections: [{ heading: "Allowed content", bullets: ["A listing must concern a real boat.", "Brand, model, year, price, condition and location must be consistent.", "Photos must show the boat concerned."] }, { heading: "Forbidden content", bullets: ["Fake listings.", "Photos copied without rights.", "Misleading information.", "Spam, fraud or abusive data collection."] }] },
    contact: { title: "Contact", intro: "Requests related to Swissnaut can be sent through the contact areas available on the platform.", sections: [{ heading: "Support", paragraphs: ["For account, listing, security or data questions, use the forms and messages available in Swissnaut."] }, { heading: "Report", paragraphs: ["Suspicious listings or messages should be reported so they can be reviewed."] }] }
  }
} satisfies Record<Locale, Record<string, LegalPageContent>>;

export function getLegalPage(locale: string, page: string) {
  const normalizedLocale: Locale = locale === "de" || locale === "it" || locale === "en" ? locale : "fr";
  const pages: Record<string, LegalPageContent> = sharedPages[normalizedLocale];
  return pages[page] ?? pages["legal-notice"];
}
