import { InspectionForm } from "@/components/forms/InspectionForm";

/** Phones only: the form sits on the homepage, right after how the estimate works. Desktop links to /free-inspection. */
export function EstimateForm() {
  return (
    <section id="estimate" aria-labelledby="estimate-title" className="ph-only theme-stone relative">
      <div className="wrap">
        <p className="t-eyebrow text-accent">Free estimate</p>
        <h2 id="estimate-title" className="t-h2 mt-5">
          Your free estimate starts here.
        </h2>
        <div className="theme-ink mt-5 !bg-transparent">
          <InspectionForm compact />
        </div>
      </div>
    </section>
  );
}
