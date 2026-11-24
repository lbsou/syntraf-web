"""tools/update_release.py : release.js reflète exactement dist/SHA256SUMS."""
import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("update_release", ROOT / "tools" / "update_release.py")
ur = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ur)


def make_dist(tmp_path, names):
    for n in names:
        (tmp_path / n).write_bytes(b"x" * 10)
    (tmp_path / "SHA256SUMS").write_text("".join(f"{'a' * 64}  {n}\n" for n in names), encoding="ascii")
    return tmp_path


def test_reads_every_package_with_its_size_and_digest(tmp_path):
    d = make_dist(tmp_path, ["syntraf-server-0.45.3-linux-x86_64.tar.gz", "syntraf-probe-0.45.3-windows-x86_64.zip",
                             "syntraf-probe-0.45.3-linux-musl-x86_64.tar.gz"])
    r = ur.read(d)
    assert r["version"] == "0.45.3" and r["tag"] == "v0.45.3"
    assert r["base"] == "https://github.com/lbsou/syntraf/releases/download/v0.45.3/"  # publiés avec le code
    assert set(r["files"]) == {"server/linux-x86_64", "probe/windows-x86_64", "probe/linux-musl-x86_64"}
    assert r["files"]["probe/windows-x86_64"] == {"name": "syntraf-probe-0.45.3-windows-x86_64.zip", "size": 10,
                                                   "sha256": "a" * 64}
    json.dumps(r)


def test_refuses_a_mix_of_versions(tmp_path):
    d = make_dist(tmp_path, ["syntraf-server-0.45-linux-x86_64.tar.gz", "syntraf-probe-0.46-linux-x86_64.tar.gz"])
    with pytest.raises(SystemExit):
        ur.read(d)


def test_every_platform_offered_by_the_page_is_known():
    js = (ROOT / "assets" / "app.js").read_text(encoding="utf-8")
    for target in ("linux-x86_64", "linux-musl-x86_64", "windows-x86_64", "macos-arm64"):
        assert f'"{target}"' in js
