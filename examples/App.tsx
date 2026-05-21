import { Toaster, toast } from "../src";
import "../src/styles.css";

export default function App() {
  return (
    <div style={{ padding: 40, fontFamily: "system-ui", display: "grid", gap: 12 }}>
      <h1>react-toaster demo</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => toast("Event has been created")}>
          Default
        </button>
        <button onClick={() => toast.success("File uploaded successfully")}>
          Success
        </button>
        <button onClick={() => toast.error("Something went wrong", { description: "Please try again later." })}>
          Error
        </button>
        <button onClick={() => toast.warning("Heads up", { description: "Storage is almost full." })}>
          Warning
        </button>
        <button onClick={() => toast.info("New version available")}>
          Info
        </button>
        <button onClick={() => toast.loading("Saving changes…")}>
          Loading
        </button>
        <button
          onClick={() =>
            toast.success("Glass!", { variant: "glass", description: "Backdrop-blur premium look." })
          }
        >
          Glass
        </button>
        <button
          onClick={() =>
            toast.success("Gradient!", { variant: "gradient" })
          }
        >
          Gradient
        </button>
        <button
          onClick={() =>
            toast("Are you sure?", {
              action: {
                label: "Undo",
                onClick: () => {
                  toast.success("Restored");
                },
              },
            })
          }
        >
          Action / Undo
        </button>
        <button
          onClick={() =>
            toast("Delete project?", {
              duration: Infinity,
              action: {
                label: "Delete",
                onClick: () => {
                  toast.success("Deleted");
                },
              },
              cancel: {
                label: "Cancel",
                onClick: () => {},
              },
            })
          }
        >
          Confirmation
        </button>
        <button
          onClick={() =>
            toast.promise(
              new Promise((res) => setTimeout(() => res({ name: "report.pdf" }), 2000)),
              {
                loading: "Uploading…",
                success: (data: any) => `Uploaded ${data.name}`,
                error: "Upload failed",
              },
            )
          }
        >
          Promise
        </button>
        <button
          onClick={() => {
            const id = toast.loading("Processing…");
            setTimeout(() => toast.update(id, { type: "success", title: "Done!", duration: 3000 }), 1500);
          }}
        >
          Update existing
        </button>
        <button
          onClick={() =>
            toast("With progress", { progressBar: true, duration: 5000, closeButton: true })
          }
        >
          With progress + close
        </button>
        <button
          onClick={() => {
            for (let i = 1; i <= 6; i++) {
              setTimeout(
                () => toast.error("Something went wrong", { description: `Attempt #${i} failed.` }),
                i * 120,
              );
            }
          }}
        >
          Spam 6 errors
        </button>
        <button onClick={() => toast.dismiss()}>Dismiss all</button>
      </div>

      <h2 style={{ marginTop: 24 }}>AOS-style animations</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(
          [
            "fade-up",
            "fade-down",
            "fade-left",
            "fade-right",
            "fade-up-right",
            "fade-up-left",
            "fade-down-right",
            "fade-down-left",
            "zoom-in",
            "zoom-out",
            "zoom-in-up",
            "zoom-out-down",
            "flip-up",
            "flip-down",
            "flip-left",
            "flip-right",
            "slide-up",
            "slide-down",
            "slide-left",
            "slide-right",
          ] as const
        ).map((name) => (
          <button
            key={name}
            onClick={() =>
              toast(`AOS: ${name}`, {
                animation: name,
                description: `Triggered with animation="${name}"`,
              })
            }
          >
            {name}
          </button>
        ))}
      </div>

      <h2 style={{ marginTop: 24 }}>Same effect via className</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => toast("via className=\"fade-left\"", { className: "fade-left" })}
        >
          className="fade-left"
        </button>
        <button
          onClick={() => toast("via className=\"zoom-in\"", { className: "zoom-in" })}
        >
          className="zoom-in"
        </button>
        <button
          onClick={() => toast("via className=\"flip-right\"", { className: "flip-right" })}
        >
          className="flip-right"
        </button>
        <button
          onClick={() => toast("via className=\"flip-right\"", { className: "flip-right" })}
        >
          className="flip-right"
        </button>
      </div>

      <Toaster
        position="bottom-right"
        theme="light"
        richColors
        closeButton
        expandOnHover
        animation="blur-fade"
        maxVisibleToasts={Infinity}
      />
    </div>
  );
}
