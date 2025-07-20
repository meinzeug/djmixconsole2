# DJ Mix Console 2 / AI DJ Mix Console

## English

This project contains **AI DJ Mix Console**, a web‑based application that simulates two Pioneer CDJ‑3000 players and a DJM‑A9 mixer. You can control the entire setup using your keyboard, load your own MP3 files and perform mixes with waveform visualisation, EQs and effects.

### Installation on Ubuntu Server

You can deploy the application on an Ubuntu server with a single command:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/meinzeug/djmixconsole2/main/install.sh)
```

The script offers an **install** and an **update** mode. During installation it performs the following steps:

1. Installs required packages (nginx, git, certbot, python3-certbot-nginx) if they are missing.
2. Ensures Node.js 22 and Vite are available.
3. Copies the repository to `/var/www/<DOMAIN>` and installs npm dependencies.
4. Builds the application with `vite build`.
5. Configures nginx with a server block for your domain and enables HTTPS via Let’s Encrypt.
6. Reloads nginx so you can access the site at `https://<DOMAIN>`.

### Updating

Running the script in **update** mode pulls the latest repository files, rebuilds the app and reloads nginx.

## Deutsch

Dieses Repository enthält die **AI DJ Mix Console**, eine webbasierte Anwendung, die zwei Pioneer CDJ‑3000 Player und einen DJM‑A9 Mixer simuliert. Die komplette Steuerung erfolgt über die Tastatur. Eigene MP3s können geladen und mit Waveform-Ansicht, EQs und Effekten gemixt werden.

### Installation auf einem Ubuntu-Server

Die App lässt sich mit folgendem Befehl direkt in der Konsole installieren:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/meinzeug/djmixconsole2/main/install.sh)
```

Das Skript hat einen **install**- und einen **update**-Modus. Beim Installieren geschieht folgendes:

1. Benötigte Pakete (nginx, git, certbot, python3-certbot-nginx) werden installiert, falls sie fehlen.
2. Node.js 22 sowie Vite werden eingerichtet.
3. Das Repository wird nach `/var/www/<DOMAIN>` kopiert und Abhängigkeiten per npm installiert.
4. Die Anwendung wird über `vite build` gebaut.
5. nginx wird mit einer Server-Block-Konfiguration für die eigene Domain versehen und per Let’s Encrypt wird ein HTTPS-Zertifikat eingerichtet.
6. Anschließend wird nginx neu geladen, sodass die Seite unter `https://<DOMAIN>` erreichbar ist.

### Update

Im **update**-Modus aktualisiert das Skript das Repository, baut die App neu und lädt nginx neu.

