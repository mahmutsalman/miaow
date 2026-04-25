import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import Map, { Source, Layer, MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { Sighting } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { MapViewHandle } from './MapView.types';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

type Props = {
  sightings: Sighting[];
  onMarkerPress: (sighting: Sighting) => void;
};

const MapView = forwardRef<MapViewHandle, Props>(function MapView(
  { sightings, onMarkerPress },
  ref
) {
  const mapRef = useRef<MapRef>(null);
  const [debugZoom, setDebugZoom] = useState(15);

  // ── GeoJSON data ──────────────────────────────────────────────────────────
  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: sightings.map((s) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
        properties: {
          sightingId: s.id,
          catCount: s.cat_count,
          feedingCount: s.feeding_count ?? 0,
        },
      })),
    }),
    [sightings]
  );

  // ── Fly to all sightings ─────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    flyToSightings: () => {
      if (!mapRef.current || sightings.length === 0) return;
      const avgLng = sightings.reduce((acc, s) => acc + s.lng, 0) / sightings.length;
      const avgLat = sightings.reduce((acc, s) => acc + s.lat, 0) / sightings.length;
      mapRef.current.flyTo({ center: [avgLng, avgLat], zoom: 15, duration: 800 });
    },
  }), [sightings]);

  // ── Click: cluster → zoom in; cat pin → open sheet ──────────────────────
  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;

      if (feature.layer.id === 'cat-cluster') {
        const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
        const z = mapRef.current?.getZoom() ?? 12;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: z + 2.5, duration: 500 });
      } else if (feature.layer.id === 'cat-pin' || feature.layer.id === 'cat-pin-bg') {
        const sighting = sightings.find((s) => s.id === feature.properties?.sightingId);
        if (sighting) onMarkerPress(sighting);
      }
    },
    [sightings, onMarkerPress]
  );

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: 28.9745, latitude: 41.023, zoom: 15 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      interactiveLayerIds={['cat-cluster', 'cat-pin', 'cat-pin-bg']}
      onClick={handleClick}
      onZoom={(e) => setDebugZoom(Math.round(e.viewState.zoom))}
    >
      {/* ── GeoJSON source with built-in clustering ── */}
      <Source
        id="cats"
        type="geojson"
        data={geojson}
        cluster
        clusterRadius={50}
        clusterMaxZoom={15}
      >
        {/* Cluster: orange circle */}
        <Layer
          id="cat-cluster"
          type="circle"
          filter={['has', 'point_count'] as any}
          paint={{
            'circle-color': Colors.primary,
            'circle-radius': ['step', ['get', 'point_count'], 26, 3, 34, 8, 42] as any,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fff',
          }}
        />

        {/* Cluster: white count label */}
        <Layer
          id="cat-cluster-label"
          type="symbol"
          filter={['has', 'point_count'] as any}
          layout={{
            'text-field': '{point_count} kedi',
            'text-size': 12,
            'text-allow-overlap': true,
          }}
          paint={{ 'text-color': '#fff' }}
        />

        {/* Individual: white circle with primary border */}
        <Layer
          id="cat-pin-bg"
          type="circle"
          filter={['!', ['has', 'point_count']] as any}
          paint={{
            'circle-color': '#fff',
            'circle-radius': 20,
            'circle-stroke-width': 2.5,
            'circle-stroke-color': Colors.primary,
          }}
        />

        {/* Individual: cat emoji */}
        <Layer
          id="cat-pin"
          type="symbol"
          filter={['!', ['has', 'point_count']] as any}
          layout={{
            'text-field': '🐱',
            'text-size': 18,
            'text-allow-overlap': true,
            'text-anchor': 'center',
          }}
        />

        {/* Individual: cat count badge (only when > 1) */}
        <Layer
          id="cat-count"
          type="symbol"
          filter={['all', ['!', ['has', 'point_count']], ['>', ['get', 'catCount'], 1]] as any}
          layout={{
            'text-field': ['to-string', ['get', 'catCount']] as any,
            'text-size': 9,
            'text-allow-overlap': true,
            'text-offset': [0.75, -0.75] as any,
          }}
          paint={{
            'text-color': '#fff',
            'text-halo-color': Colors.primary,
            'text-halo-width': 3,
          }}
        />
      </Source>

      {/* ── Debug overlay — Chrome sağ tık olmadan durumu görmek için ── */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          right: 12,
          background: 'rgba(0,0,0,0.78)',
          color: '#fff',
          padding: '8px 11px',
          borderRadius: 8,
          fontSize: 11,
          fontFamily: 'monospace',
          lineHeight: 1.65,
          zIndex: 9999,
          pointerEvents: 'none',
          userSelect: 'none',
          minWidth: 140,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 3 }}>🛠 Debug</div>
        <div>Zoom: <b>{debugZoom}</b></div>
        <div>Nokta sayısı: <b>{sightings.length}</b></div>
        <div>Render: <b>Source/Layer ✓</b></div>
        <div style={{ fontSize: 9, marginTop: 4, opacity: 0.6 }}>
          cluster maxZoom: 15<br />
          cluster radius: 50px
        </div>
      </div>
    </Map>
  );
});

export default MapView;
