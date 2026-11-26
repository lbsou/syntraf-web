// SYNTRAF : choix du rôle et de la plateforme, puis la procédure d'installation correspondante (FR / EN).
(function () {
  "use strict";

  var T = {
    fr: {
      skip: "Aller à l'installation",
      tagline: "La perte, la gigue et la latence entre tous vos sites, mesurées en continu.",
      meshTitle: "Cinq sondes qui se mesurent deux à deux",
      installTitle: "Installer",
      roleLegend: "Cette machine sera",
      roleServer: "le serveur", roleServerHint: "interface web, VictoriaMetrics et Grafana",
      roleProbe: "une sonde", roleProbeHint: "mesure vers les autres sondes",
      platformLegend: "Sur", macosHint: "Apple silicon",
      footVersion: "Version", footSource: "Code source et documentation",
      download: "Télécharger", downloadTitle: "Télécharger le package",
      offline: "La machine n'a pas accès à Internet ? Copiez l'archive dessus (scp, clé USB) : l'installation se fait sans réseau.",
      orCurl: "Ou directement sur la machine :",
      verify: "Vérifier l'empreinte SHA-256",
      install: "Installer", installAdmin: "Installer, dans un terminal (PowerShell ou invite de commandes) lancé en administrateur",
      probeFields: "Indiquez le serveur et le jeton d'enrôlement : ils s'insèrent dans la commande.",
      fServer: "Adresse du serveur", fToken: "Jeton d'enrôlement",
      tokenWhere: "Le jeton s'affiche à la fin de l'installation du serveur ; on le retrouve dans l'interface, Server › Tokens.",
      serverInstalls: "Le script installe SYNTRAF, VictoriaMetrics et Grafana, les relie et crée les services. Il affiche ensuite les adresses, le jeton des sondes et l'emplacement des mots de passe.",
      probeInstalls: "Le script installe la sonde et son service ; elle se présente aussitôt au serveur.",
      open: "Ouvrir l'interface",
      openText: "Interface web : {web}, compte admin, mot de passe dans {pw}.",
      grafanaText: "Grafana : {gf}, compte admin, mot de passe dans {gpw}. Les tableaux de bord SYNTRAF y sont déjà.",
      ports: "Ports à ouvrir sur le serveur : 6531/tcp pour les sondes, 5000/tcp pour l'interface, 3000/tcp pour Grafana.",
      nextServer: "Ensuite : créez un groupe de mesure dans l'interface, puis installez les sondes.",
      accept: "Accepter la sonde",
      acceptText: "Dans l'interface du serveur, page Clients, section « En attente d'approbation » : acceptez-la. Le serveur lui envoie ses flux et les mesures commencent.",
      macIperf: "macOS : il n'existe pas encore de iperf3v pour Mac. Installez d'abord iperf3 (3.17 ou plus récent), par exemple avec Homebrew : {brew}",
      macQuarantine: "Archive téléchargée avec un navigateur ? Retirez la quarantaine de macOS avant d'installer : {xattr}",
      macUntested: "Le package macOS n'a pas encore été essayé sur un Mac.",
      update: "Mettre à jour ou désinstaller",
      updateText: "Mettre à jour : installez le package d'une version plus récente de la même façon ; la configuration et les mesures sont gardées. Désinstaller : {un} dans le dossier du package ({purge} efface aussi configuration et données).",
      copy: "Copier", copied: "Copié", srv: "<serveur>", tok: "<jeton>",
      missing: "Ce package n'est pas publié pour la version {v}. Les autres sont dans les releases GitHub.",
      choose: "",
      mib: "Mio"
    },
    en: {
      skip: "Skip to installation",
      tagline: "Loss, jitter and latency between all your sites, measured continuously.",
      meshTitle: "Five probes measuring each other in pairs",
      installTitle: "Install",
      roleLegend: "This machine will be",
      roleServer: "the server", roleServerHint: "web interface, VictoriaMetrics and Grafana",
      roleProbe: "a probe", roleProbeHint: "measures towards the other probes",
      platformLegend: "Running", macosHint: "Apple silicon",
      footVersion: "Version", footSource: "Source code and documentation",
      download: "Download", downloadTitle: "Download the package",
      offline: "No Internet access on that machine? Copy the archive to it (scp, USB key): the installation needs no network.",
      orCurl: "Or straight on the machine:",
      verify: "Check the SHA-256 digest",
      install: "Install", installAdmin: "Install, in a terminal (PowerShell or Command Prompt) run as administrator",
      probeFields: "Enter the server and the enrollment token: they go into the command.",
      fServer: "Server address", fToken: "Enrollment token",
      tokenWhere: "The token is shown at the end of the server installation, and in the interface under Server › Tokens.",
      serverInstalls: "The script installs SYNTRAF, VictoriaMetrics and Grafana, binds them together and creates the services. It then prints the addresses, the probe token and where the passwords are.",
      probeInstalls: "The script installs the probe and its service; the probe then introduces itself to the server.",
      open: "Open the interface",
      openText: "Web interface: {web}, account admin, password in {pw}.",
      grafanaText: "Grafana: {gf}, account admin, password in {gpw}. The SYNTRAF dashboards are already there.",
      ports: "Ports to open on the server: 6531/tcp for the probes, 5000/tcp for the interface, 3000/tcp for Grafana.",
      nextServer: "Next: create a measurement group in the interface, then install the probes.",
      accept: "Accept the probe",
      acceptText: "In the server interface, Clients page, “Waiting for approval”: accept it. The server sends it its flows and the measurements start.",
      macIperf: "macOS: there is no iperf3v for Mac yet. Install iperf3 first (3.17 or later), for instance with Homebrew: {brew}",
      macQuarantine: "Downloaded with a browser? Remove the macOS quarantine before installing: {xattr}",
      macUntested: "The macOS package has not been tried on a Mac yet.",
      update: "Update or uninstall",
      updateText: "Update: install the package of a newer version the same way; configuration and measurements are kept. Uninstall: {un} in the package folder ({purge} also erases configuration and data).",
      copy: "Copy", copied: "Copied", srv: "<server>", tok: "<token>",
      missing: "This package is not published for version {v}. The others are in the GitHub releases.",
      mib: "MiB"
    }
  };

  var TARGET = { debian: "linux-x86_64", rhel: "linux-x86_64", alpine: "linux-musl-x86_64",
                 windows: "windows-x86_64", macos: "macos-arm64" };
  var CONF = { linux: "/etc/syntraf-{r}", macos: "/usr/local/etc/syntraf-{r}", windows: "C:\\ProgramData\\SYNTRAF\\{r}" };
  var R = window.SYNTRAF_RELEASE || { version: "?", files: {}, base: "" };
  var state = { lang: "fr", role: null, platform: null, server: "", token: "" };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function t(key, vars) {
    var s = (T[state.lang][key] !== undefined ? T[state.lang][key] : T.fr[key]) || "";
    s = esc(s);
    Object.keys(vars || {}).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function code(s) { return "<code>" + esc(s) + "</code>"; }
  function cmd(text) {
    return '<div class="cmd"><pre>' + esc(text) + '</pre><button type="button" data-copy>' + t("copy") + "</button></div>";
  }
  // Valeur saisie : mise entre apostrophes si elle contient autre chose que des caractères sûrs pour le shell
  function shellArg(v, placeholder) {
    v = v.trim();
    if (!v) return placeholder;
    return /^[A-Za-z0-9._:@\/-]+$/.test(v) ? v : "'" + v.replace(/'/g, "'\\''") + "'";
  }
  // install.cmd passe ses paramètres à PowerShell (-File) : guillemets doubles, retirés par cmd.exe comme par PowerShell
  function cmdArg(v, placeholder) {
    v = v.trim();
    if (!v) return placeholder;
    return /^[A-Za-z0-9._:@\/-]+$/.test(v) ? v : '"' + v.replace(/"/g, "") + '"';
  }

  function render() {
    var box = document.getElementById("procedure");
    if (!state.role || !state.platform) { box.innerHTML = ""; return; }
    var role = state.role, plat = state.platform, target = TARGET[plat];
    var f = R.files[role + "/" + target];
    if (!f) {
      box.innerHTML = '<p class="missing">' + t("missing", { v: esc(R.version) }) +
        ' <a href="https://github.com/lbsou/syntraf/releases">GitHub releases</a></p>';
      return;
    }
    var win = plat === "windows", mac = plat === "macos";
    var url = R.base + f.name;
    var dir = f.name.replace(/\.(tar\.gz|zip)$/, "");
    var conf = CONF[win ? "windows" : mac ? "macos" : "linux"].replace("{r}", role);
    var sep = win ? "\\" : "/";
    var size = Math.round(f.size / 1048576) + " " + t("mib");
    var html = '<ol class="steps">';

    // 1. Télécharger
    html += "<li><h3>" + t("downloadTitle") + "</h3>" +
      '<a class="download" href="' + esc(url) + '">' + t("download") + " <span>" + esc(f.name) + "</span><small>" + size + "</small></a>" +
      "<p class=\"note\">" + t("offline") + "</p>" +
      "<details><summary>" + t("orCurl") + "</summary>" +
      cmd(win ? "curl.exe -LO " + url : "curl -LO " + url) + "</details>" +
      "<details><summary>" + t("verify") + "</summary><p class=\"sha\">" + esc(f.sha256) + "</p>" +
      cmd(win ? "(Get-FileHash " + f.name + ").Hash -eq '" + f.sha256.toUpperCase() + "'"
              : "echo '" + f.sha256 + "  " + f.name + "' | " + (mac ? "shasum -a 256 -c" : "sha256sum -c")) +
      "</details></li>";

    // 2. Installer
    html += "<li><h3>" + t(win ? "installAdmin" : "install") + "</h3>";
    if (mac) {
      html += '<p class="note">' + t("macIperf", { brew: code("brew install iperf3") }) + "</p>" +
              '<p class="note">' + t("macQuarantine", { xattr: code("xattr -dr com.apple.quarantine " + f.name) }) + "</p>";
    }
    if (role === "probe") {
      html += "<p>" + t("probeFields") + '</p><div class="fields">' +
        '<label>' + t("fServer") + '<input id="f-server" autocomplete="off" spellcheck="false" placeholder="10.0.0.5" value="' + esc(state.server) + '"></label>' +
        '<label>' + t("fToken") + '<input id="f-token" autocomplete="off" spellcheck="false" value="' + esc(state.token) + '"></label></div>';
    }
    var args = "";
    if (role === "probe") {
      var ps = T[state.lang].srv, pt = T[state.lang].tok;
      args = win ? " -Server " + cmdArg(state.server, ps) + " -Token " + cmdArg(state.token, pt)
                 : " --server " + shellArg(state.server, ps) + " --token " + shellArg(state.token, pt);
    }
    html += cmd(win
      ? "tar -xf " + f.name + "\ncd " + dir + "\n.\\install.cmd" + args
      : "tar xzf " + f.name + "\ncd " + dir + "\nsudo ./install.sh" + args);
    html += '<p class="note">' + t(role === "server" ? "serverInstalls" : "probeInstalls") + "</p>";
    if (role === "probe") html += '<p class="note">' + t("tokenWhere") + "</p>";
    if (mac) html += '<p class="note">' + t("macUntested") + "</p>";
    html += "</li>";

    // 3. Ouvrir l'interface / accepter la sonde
    if (role === "server") {
      html += "<li><h3>" + t("open") + "</h3>" +
        "<p>" + t("openText", { web: code("https://" + T[state.lang].srv + ":5000"), pw: code(conf + sep + "config.toml.initial_admin_password") }) + "</p>" +
        "<p>" + t("grafanaText", { gf: code("http://" + T[state.lang].srv + ":3000"), gpw: code(conf + sep + "grafana-admin-password") }) + "</p>" +
        '<p class="note">' + t("ports") + "</p>" +
        "<p>" + t("nextServer") + "</p></li>";
    } else {
      html += "<li><h3>" + t("accept") + "</h3><p>" + t("acceptText") + "</p></li>";
    }
    html += "</ol>";

    html += '<div class="after"><details><summary>' + t("update") + "</summary><p>" +
      t("updateText", { un: code(win ? ".\\uninstall.cmd" : "sudo ./uninstall.sh"), purge: code(win ? "-Purge" : "--purge") }) +
      "</p></details></div>";

    box.innerHTML = html;
    bindFields();
  }

  function bindFields() {
    ["server", "token"].forEach(function (k) {
      var el = document.getElementById("f-" + k);
      if (!el) return;
      el.addEventListener("input", function () {
        state[k] = el.value;  // brut : les espaces ne se retirent qu'à la construction de la commande
        var pos = el.selectionStart;
        render();
        var again = document.getElementById("f-" + k);
        again.focus();
        try { again.setSelectionRange(pos, pos); } catch (e) { /* champ sans sélection */ }
      });
    });
  }

  function applyLang(lang) {
    state.lang = T[lang] ? lang : "fr";
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (T[state.lang][k] !== undefined) el.textContent = T[state.lang][k];
    });
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === state.lang));
    });
    document.title = "SYNTRAF";
    try { localStorage.setItem("syntraf-lang", state.lang); } catch (e) { /* stockage refusé */ }
    render();
  }

  // #server/debian : lien direct vers une procédure
  function fromHash() {
    var m = /^#(server|probe)\/(debian|rhel|alpine|windows|macos)$/.exec(location.hash);
    if (!m) return;
    state.role = m[1]; state.platform = m[2];
    document.querySelector('input[name="role"][value="' + m[1] + '"]').checked = true;
    document.querySelector('input[name="platform"][value="' + m[2] + '"]').checked = true;
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (b) {
      var text = b.previousElementSibling.textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
        b.textContent = t("copied"); b.classList.add("done");
        setTimeout(function () { b.textContent = t("copy"); b.classList.remove("done"); }, 1600);
      }, function () {
        var r = document.createRange(); r.selectNodeContents(b.previousElementSibling);
        var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      });
      return;
    }
    var l = e.target.closest("[data-lang]");
    if (l) applyLang(l.getAttribute("data-lang"));
  });

  document.addEventListener("change", function (e) {
    if (e.target.name === "role" || e.target.name === "platform") {
      state[e.target.name] = e.target.value;
      if (state.role && state.platform) history.replaceState(null, "", "#" + state.role + "/" + state.platform);
      render();
    }
  });

  document.getElementById("version").textContent = R.version;
  fromHash();
  window.addEventListener("hashchange", function () { fromHash(); render(); });  // lien partagé, page déjà ouverte
  var saved = null;
  try { saved = localStorage.getItem("syntraf-lang"); } catch (e) { /* stockage refusé */ }
  var param = new URLSearchParams(location.search).get("lang");
  applyLang(param || saved || ((navigator.language || "fr").slice(0, 2) === "fr" ? "fr" : "en"));
})();
