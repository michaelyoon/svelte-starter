# Development Notes

## hCaptcha

From the [hCaptcha](https://docs.hcaptcha.com/#local-development) documentation:

> The hCaptcha API ... prohibits `localhost` and `127.0.0.1` as supplied hostnames. The simplest way to circumvent these issues is to add a hosts entry. ... Place this in `/etc/hosts` on Linux, `/private/etc/hosts` on Mac OS X, or `C:\Windows\System32\Drivers\etc\hosts` on Windows.

## SSL

In order for cookies to work locally with a hostname other than `localhost`, we need an SSL connection. To
"[p]rovide certificates for vite's https dev service," use [`vite-plugin-mkcert`](https://github.com/liuweiGL/vite-plugin-mkcert).

---

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Building

To create a production version of your app:

```zsh
bun run build
```

You can preview the production build with `bun run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
