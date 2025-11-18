import React from "react";
import { useNavigate } from "react-router-dom";

const EMS_BG =
  "linear-gradient(120deg,#ede7fe 0%, #f6f7fa 57%, #e8e9ff 100%)";
const CARD = "rgba(255,255,255,0.87)";
const CARD_SHADOW = "0 10px 40px #9d7ddf12, 0 2px 8px #bdbaff28";
const BORDER = "#ece6fe";
const COLORS = {
  accent: "#7659e7",
  accent2: "#26a9e0",
  success: "#12b48b",
  wait: "#f3b437",
  softTitle: "#653cdb",
  faded: "#8577bc",
};

export default function ApprovalPage() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: EMS_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "Inter,'Segoe UI','Helvetica Neue',Arial,sans-serif",
      }}
    >
      <div
        style={{
          background: CARD,
          borderRadius: 27,
          border: `1.9px solid ${BORDER}`,
          boxShadow: CARD_SHADOW,
          padding: "52px 38px 40px 38px",
          maxWidth: 480,
          width: "97%",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Animated Loading Icon or Icon */}
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              display: "inline-block",
              background: "radial-gradient(#eeecec80 60%, #7c64e5 140%)",
              borderRadius: "50%",
              padding: 18,
              boxShadow: "0 2px 22px #9789e834, 0 0px 0 #fff0",
            }}
          >
            <svg
              width="46"
              height="46"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.wait}
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0 0 8px #fbc53b90)",
              }}
            >
              {/* Hourglass Shape */}
              <path d="M6 2h12M6 22h12M6 2c0 6 6 6 6 10s-6 4-6 10m12 0c0-6-6-6-6-10s6-4 6-10" />
            </svg>
          </span>
        </div>
        {/* Heading */}
        <div
          style={{
            fontSize: "2.04rem",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            background:
              "linear-gradient(90deg, #7659e7 40%, #26a9e0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 15,
          }}
        >
          Awaiting Admin Approval
        </div>
        {/* Description */}
        <div
          style={{
            color: COLORS.faded,
            fontSize: "1.21rem",
            marginBottom: 12,
            lineHeight: 1.53,
          }}
        >
          Your registration request as an <span style={{ color: COLORS.accent, fontWeight: 600 }}>employee</span> has been received
          and is being reviewed by our team. <br />
          <span style={{ color: COLORS.accent2, fontWeight: 500 }}>
            Access will be granted once approved by an admin.
          </span>
        </div>
        {/* Subtle Info */}
        <div
          style={{
            color: "#7d6fe6",
            fontWeight: 600,
            fontSize: "1.07rem",
            margin: "7px 0 25px 0",
            opacity: 0.92,
          }}
        >
          This page will remain until your account is activated.
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            background:
              "linear-gradient(90deg, #7659e7 20%, #26a9e0 100%)",
            color: "#fff",
            fontWeight: 800,
            letterSpacing: "0.005em",
            border: "none",
            padding: "15px 0",
            fontSize: "1.18rem",
            borderRadius: 12,
            width: "100%",
            boxShadow: "0 2px 10px #837ef340",
            cursor: "pointer",
            transition: "background .2s",
          }}
        >
          &larr; Back to Role Selection
        </button>
        <div
          style={{
            marginTop: 33,
            color: "#8776cebb",
            fontSize: ".99rem",
            lineHeight: 1.4,
          }}
        >
          
        </div>
      </div>
    </div>
  );
}
