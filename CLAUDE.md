# Prasia Web — Contexto del proyecto

## Qué es esto
Sitio web corporativo estático de **Prasia** — empresa de automatizaciones con IA para pymes españolas, con base en Sevilla.

- **Dominio:** https://prasia.es
- **Repo GitHub:** https://github.com/AndresTena/prasia-web
- **Stack:** HTML5 + CSS3 + JS ES6+ vanilla. Sin frameworks, sin build step.

## Archivos
- `index.html` — página principal completa
- `styles.css` — todos los estilos (paleta cream + dark, Space Grotesk + Instrument Serif)
- `main.js` — navbar, dark card scroll-expand, reveal, counters, quiz, contact form
- `legal.html` / `privacidad.html` — páginas legales (placeholders)

## Paleta de colores
- Fondo principal: `--cream: #EDEBE4` (Anthropic-inspired)
- Dark sections: `--dark: #1A1916`
- Acento: `--gold: #D4B896` (arena dorada pastel)

## Marca
- Logo: `pras` minúscula + `IA` mayúscula en dorado → refuerza posicionamiento IA
- Tipografías: Space Grotesk (UI) + Instrument Serif italic (contraste editorial en `<em>`)

## Deploy
- **URL:** prasia.es (+ www) · **Rama:** `master` · **Ruta VPS:** `/opt/prasia-web`
- **Cómo se sirve:** contenedor `prasia-web` (`nginx:alpine`) que monta `/opt/prasia-web` como volumen **`:ro`** (puerto 8081→80, detrás de Traefik). Por eso **basta `git pull`, sin build**.
- **Flujo (orden uniforme):** `git push origin master` → `/deploy` → Boteli, EN EL HOST: `cd /opt/prasia-web && git pull && bash deploy.sh`
- **Claude NO toca el servidor directamente** — siempre delegar a Boteli via SSH

## Cómo comunicarse con Boteli
```bash
echo '{"model":"openclaw/main","input":"MENSAJE"}' > /tmp/payload.json

ssh -i ~/.ssh/boteli_key -o StrictHostKeyChecking=no root@187.124.55.56 \
  "docker exec -i openclaw-klxi-openclaw-1 curl -s --max-time 300 \
    -X POST http://127.0.0.1:18789/v1/responses \
    -H 'Authorization: Bearer eL2CwZWhZIus07SMaRXQExrZDAUECUQK' \
    -H 'Content-Type: application/json' \
    -d @-" < /tmp/payload.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['output'][0]['content'][0]['text'])"
```
Respuesta en: `output[0].content[0].text`

## Endpoint backend
`POST https://prasia.es/api/lead` — recibe leads del quiz y del formulario de contacto.
Actualmente devuelve `200 {}` (stub). Backend real pendiente de implementar por Boteli.

## Referencias de diseño (por orden de prioridad)
1. https://www.anthropic.com
2. https://www.magnific.com/es
3. https://openai.com/es-ES/
4. https://traderepublic.com/es-es

---

## Estado actual

> Última sesión: —

**Hecho en esta sesión:** —

**En progreso:** —

**Pendiente:**
- [ ] Implementar backend real para `POST /api/lead` (actualmente stub 200 {})

**Notas para la próxima sesión:** —
