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
- **Frontend:** estático servido por Nginx en el VPS vía Traefik
- **Backend/deploy:** lo gestiona **Boteli** (agente IA en VPS 187.124.55.56)
- **Flujo:** `git push` a GitHub → mensaje a Boteli → `git pull` en `/opt/prasia-web`
- **Claude NO toca el servidor directamente** — siempre delegar a Boteli via SSH

## Endpoint backend
`POST https://prasia.es/api/lead` — recibe leads del quiz y del formulario de contacto.
Actualmente devuelve `200 {}` (stub). Backend real pendiente de implementar por Boteli.

## Referencias de diseño (por orden de prioridad)
1. https://www.anthropic.com
2. https://www.magnific.com/es
3. https://openai.com/es-ES/
4. https://traderepublic.com/es-es
