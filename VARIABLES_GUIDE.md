# Guide des variables dynamiques

Ce template utilise des placeholders au format {{...}} pour l’injection côté backend. Chaque variable doit être remplacée avec une valeur réelle avant génération PDF.

## Variables principales

### company.name
- Type: string
- Description: Nom de la société ou du client.
- Exemple: DELIRIUM

### company.legalInfo.address
- Type: string
- Description: Adresse légale de la société.
- Exemple: 15، شارع محمد الخامس، الرباط

### company.legalInfo.taxNumber
- Type: string
- Description: Numéro fiscal ou numéro d’étage/suite.
- Exemple: 2B

### company.legalInfo.commercialRegistryNumber
- Type: string
- Description: Numéro d’immatriculation au registre de commerce.
- Exemple: RC 123456

### company.references.journalNumber
- Type: string
- Description: Numéro de publication au Journal officiel.
- Exemple: 3668

### company.references.journalDate
- Type: string
- Description: Date de publication ou de référence.
- Exemple: 12 أبريل 2026

### company.document.subject_ar
- Type: string
- Description: Objet de la demande en arabe.
- Exemple: تغيير النشاط

### company.document.body_ar
- Type: string
- Description: Corps principal du document en arabe.
- Exemple: و بعد الاطلاع على التعديلات المتعلقة بشركة DELIRIUM ...

### company.signatories.director.name
- Type: string
- Description: Nom du signataire directeur.
- Exemple: محمد الدوسي

### company.signatories.director.title
- Type: string
- Description: Fonction du signataire.
- Exemple: مدير المطبعة الرسمية

### company.signatories.director.signatureImageUrl
- Type: URL string
- Description: URL de l’image de la signature.
- Exemple: https://cdn.example.com/signatures/directeur.png

### company.media.officialSealUrl
- Type: URL string
- Description: URL du sceau officiel de l’administration.
- Exemple: https://cdn.example.com/seals/maroc-official-seal.png

## Exemple de payload JSON

```json
{
  "company": {
    "name": "DELIRIUM",
    "legalInfo": {
      "address": "15، شارع محمد الخامس، الرباط",
      "taxNumber": "2B",
      "commercialRegistryNumber": "RC 123456"
    },
    "references": {
      "journalNumber": "3668",
      "journalDate": "12 أبريل 2026"
    },
    "document": {
      "subject_ar": "تغيير النشاط",
      "body_ar": "و بعد الاطلاع على التعديلات المتعلقة بشركة DELIRIUM ..."
    },
    "signatories": {
      "director": {
        "name": "محمد الدوسي",
        "title": "مدير المطبعة الرسمية",
        "signatureImageUrl": "https://cdn.example.com/signatures/directeur.png"
      }
    },
    "media": {
      "officialSealUrl": "https://cdn.example.com/seals/maroc-official-seal.png"
    }
  }
}
```

## Remarques
- Le template supporte le RTL pour les textes arabes.
- Les éléments importants sont en couleur or : #FFD700.
- Les images de signature et de sceau sont prévues comme placeholders de fond ajoutés plus tard.
- Le document est prêt pour génération PDF via Puppeteer ou un moteur HTML-to-PDF.
