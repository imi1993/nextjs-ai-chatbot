export default function Loading() {
  return (
    <div className="st-loading" aria-busy="true" aria-label="Chargement">
      <div className="st-skel st-skel-hero" />
      <div className="st-grid2">
        <div className="st-skel st-skel-block" />
        <div className="st-skel st-skel-block" />
      </div>
    </div>
  );
}
