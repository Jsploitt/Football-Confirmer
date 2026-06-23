export default function MapSection({ locationName, mapEmbedUrl, directionsUrl }) {
  return (
    <div className="section map-section">
      <div className="section-title">Venue</div>
      <div className="map-card">
        <iframe
          className="map-frame"
          src={mapEmbedUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Football field location"
          aria-label="Interactive map showing match venue"
        />
        <div className="map-footer">
          <span className="map-footer-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {locationName}
          </span>
          <a
            className="btn-directions"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open directions in Google Maps"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            Get Directions
          </a>
        </div>
      </div>
    </div>
  )
}
