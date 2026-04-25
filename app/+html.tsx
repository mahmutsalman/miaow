import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <link
          href="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body, #root { height: 100%; margin: 0; padding: 0; }
            .maplibregl-map { height: 100%; }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
