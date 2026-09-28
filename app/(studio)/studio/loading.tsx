export default function Loading() {
  return (
    <div className="st-page" aria-busy="true" aria-label="Chargement">
      <div className="st-skel st-skel-head" />
      <div className="st-skel st-skel-bar" />
      <div className="st-today">
        <div className="st-skel st-skel-block" />
        <div className="st-skel st-skel-block" />
      </div>
    </div>
  );
}
