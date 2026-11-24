# syntraf-web

Site d'installation de [SYNTRAF](https://github.com/lbsou/syntraf) : on choisit le rôle de la machine (serveur ou
sonde) et sa plateforme, la procédure d'installation s'affiche. Français et anglais. Statique, sans étape de
construction : GitHub Pages le sert tel quel.

| Fichier | Rôle |
|---|---|
| `index.html`, `assets/` | la page, son style, la procédure (`assets/app.js`, textes FR/EN compris) |
| `release.js` | la version publiée : nom, taille et SHA-256 de chaque archive (généré, ne pas modifier à la main) |
| `tools/update_release.py` | écrit `release.js` à partir du dossier `dist/` de SYNTRAF |

## Publier une version

Les archives (environ 400 Mio pour un serveur, 30 à 45 Mio pour une sonde) ne vont pas dans ce dépôt : elles sont
jointes à la release GitHub `v<version>` du dépôt [lbsou/syntraf](https://github.com/lbsou/syntraf/releases), d'où
la page les télécharge.

```sh
# 1. dans le dépôt SYNTRAF : construire les packages (Internet et Docker nécessaires)
python packaging/build_packages.py
# 2. publier la release v<version> de lbsou/syntraf avec dist/syntraf-* et dist/SHA256SUMS
#    (gh release create v<version> ../syntraf/dist/syntraf-* ../syntraf/dist/SHA256SUMS, ou l'interface GitHub)
# 3. ici : mettre la page à la version publiée
python tools/update_release.py ../syntraf/dist
```

## Mise en ligne de la page

La page est statique : GitHub Pages la sert telle quelle depuis la racine de la branche `main`, une fois ce dépôt
créé sur GitHub (`lbsou/syntraf-web`) et Pages activé (Settings › Pages, source : `main`, `/`). Elle est alors à
`https://lbsou.github.io/syntraf-web/`.

## Essayer en local

```sh
python -m http.server 8000      # puis http://127.0.0.1:8000/  (#server/debian, ?lang=en, etc.)
python -m pytest tests          # contrôle de tools/update_release.py
```

Polices : Atkinson Hyperlegible Next et Mono (Google Fonts). Le maillage animé s'arrête si le système demande moins
d'animations.
