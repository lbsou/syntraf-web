#!/usr/bin/env python3
"""Met le site à jour pour une nouvelle version de SYNTRAF : écrit release.js depuis le dossier dist/ de SYNTRAF.

    python tools/update_release.py ../syntraf/dist

Lit dist/SHA256SUMS et la taille de chaque archive (syntraf-<rôle>-<version>-<plateforme>.<ext>). Les archives sont
les fichiers joints de la release GitHub v<version> du dépôt lbsou/syntraf (voir README.md).
"""
import json
import re
import sys
from pathlib import Path

REPO = "lbsou/syntraf"  # les packages sont publiés comme release du dépôt du code
NAME = re.compile(r"^syntraf-(server|probe)-([0-9][0-9.]*)-([a-z0-9_-]+?)\.(tar\.gz|zip)$")
OUT = Path(__file__).resolve().parents[1] / "release.js"


def read(dist):
    dist = Path(dist)
    files, versions = {}, set()
    for line in (dist / "SHA256SUMS").read_text(encoding="ascii").splitlines():
        if not line.strip():
            continue
        digest, name = line.split(None, 1)
        name = name.strip().lstrip("*")
        m = NAME.match(name)
        if not m:
            continue
        role, version, target, _ = m.groups()
        versions.add(version)
        files[f"{role}/{target}"] = {"name": name, "size": (dist / name).stat().st_size, "sha256": digest}
    if len(versions) != 1:
        raise SystemExit(f"une seule version attendue dans SHA256SUMS, trouvé : {sorted(versions) or 'aucune'}")
    version = versions.pop()
    return {"version": version, "tag": f"v{version}",
            "base": f"https://github.com/{REPO}/releases/download/v{version}/", "files": files}


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    release = read(sys.argv[1])
    OUT.write_text("// Généré par tools/update_release.py : ne pas modifier à la main.\nwindow.SYNTRAF_RELEASE = "
                   + json.dumps(release, indent=2) + ";\n", encoding="utf-8")
    print(f"release.js : SYNTRAF {release['version']}, {len(release['files'])} archives")


if __name__ == "__main__":
    main()
