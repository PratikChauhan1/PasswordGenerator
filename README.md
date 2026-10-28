# PASSWORD GENERATOR — Random Password Generator

React + Vite + Tailwind CSS frontend and Python serverless API, prepared for Vercel.

## Run locally

Install Node.js 18+ and Python 3.10+.

```bash
npm install
npm install -g vercel
vercel dev
```

Use the local URL shown by the Vercel CLI. `npm run dev` alone runs Vite and does not serve the Python `/api/generate` endpoint.

## Deploy to Vercel

1. Push all project files to a GitHub repository.
2. Import the repository at https://vercel.com/new.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy. The `api/generate.py` file should remain in the root-level `api` folder.

## Tailwind CSS

Tailwind is configured in `tailwind.config.js`, `postcss.config.js`, and `src/index.css`. Most component styling lives directly in `src/main.jsx` as utility classes. There is no separate `style.css`.

## Assignment concepts

The Python API uses `string.ascii_uppercase`, `string.ascii_lowercase`, `string.digits`, lists, `random.choice()` and `random.shuffle()`. It accepts settings as JSON and returns a generated password as JSON.

Security note: the assignment asks for Python's `random` module. For real production account passwords, use Python's `secrets` module instead.
